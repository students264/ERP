const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const jwt = require('jsonwebtoken')
const session=require('express-session');
const { chromium } = require("playwright");
const Admin = require('./model/admin')
const studentmodel = require('./model/student')
const attandancemodel = require('./model/attandance')
const paymentmodel = require('./model/payment')
const employeeModel = require('./model/employee')
const servicemodel = require('./model/service')
const expencemodel = require('./model/expence')
const cookieParser = require('cookie-parser');
const app = express()
const isLoggined = require('./middleware')
const attendanceModel = require('./model/attandance')
require('dotenv').config()
const port = process.env.PORT
app.use(cookieParser())
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.set('view engine', 'ejs')
app.set('views', path.resolve(__dirname, 'views'))
app.use(
  session({
    secret: "progyan-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 30,
    },
  })
);
mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log('mongodb connect')
}).catch((err)=>{
    console.log('mongodb conection error',err)
})
app.get('/', isLoggined, (req, res) => {
    let status = req.cookies.status
    return res.render('home',{status});
});
app.post('/payment/check/', async (req, res) => {
  try {
    if (!req.session.billData) {
      req.session.billData = [];
    }
    const { date1, date2 } = req.body;
    const startDate = new Date(date1);
    const endDate = new Date(date2);
    endDate.setDate(endDate.getDate() + 1);
    const data = await paymentmodel.find({
      Date: {
        $gte: startDate,
        $lt: endDate
      }
    });
    if (data.length === 0) {
      return res.render("paybill",{msg:'NO Record Found',data});
    }
    const date = new Date().toLocaleDateString()
    req.session.billData = [];
    data.forEach(item => {
      req.session.billData.push({
        date:date,
        Name: item.s_name,
        mr: item.mr,
        Date: item.Date,
        Month: item.Month,
        year: item.Year,
        Account: item.Account,
        payment: item.payment,
        Mode: item.Mode,
        rn: item.rn,
        Amount: item.Amount
      });
    });
    res.render('paybill', { data: req.session.billData , msg:' '});
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
app.post('/expence/check/', async (req, res) => {
  try {
    if (!req.session.expenceData) {
      req.session.expenceData = [];
    }
    const { date1, date2 } = req.body;
    const startDate = new Date(date1);
    const endDate = new Date(date2);
    endDate.setDate(endDate.getDate() + 1);
    const data = await expencemodel.find({
      Date: {
        $gte: startDate,
        $lt: endDate
      }
    });
    if (data.length === 0) {
      return res.render("expbill",{msg:'NO Record Found',data});
    }
    const date = new Date().toLocaleDateString()
    req.session.expenceData = [];
    data.forEach(item => {
      req.session.expenceData.push({
        date:date,
        year: item.year,
        Month: item.Month,
        Date: item.Date,
        pay: item.Pay,
        Mode: item.Mode,
        Reciept: item.Reciept,
        rn: item.rn,
        Amount: item.Amount
      });
    });
    res.render('expbill', { data: req.session.expenceData,msg:' '});
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
app.get('/payment/std', (req, res) => {
  if (!req.session.billData || req.session.billData.length === 0) {
    return res.send("No bill data found");
  }
  res.render('paybill', { data: req.session.billData,msg:' '});
});
app.get("/payment/download-pdf", async (req, res) => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  if (req.headers.cookie) {
    const cookieValue = req.headers.cookie.split("connect.sid=")[1]?.split(";")[0];
    if (cookieValue) {
      await context.addCookies([
        {
          name: "connect.sid",
          value: cookieValue,
          url: "http://localhost:4000",
        },
      ]);
    }
  }

  const page = await context.newPage();
  await page.goto("http://localhost:4000/payment/std", {
    waitUntil: "networkidle",
  });
  const pdfBuffer = await page.pdf({
    width: "10in",
    height: "14in",
    printBackground: true,
    margin: {
        top: "10px",
        right: "10px",
        bottom: "10px",
        left: "10px",
    }
});
  await browser.close();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=bill.pdf");
  res.end(pdfBuffer);
  req.session.billData = [];
});
app.get('/bill/expence', (req, res) => {
  if (!req.session.expenceData || req.session.expenceData.length === 0) {
    return res.send("No bill data found");
  }
  res.render('expbill', { data: req.session.expenceData,msg:' '});
});
app.get("/expence/download-pdf", async (req, res) => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  if (req.headers.cookie) {
    const cookieValue = req.headers.cookie.split("connect.sid=")[1]?.split(";")[0];
    if (cookieValue) {
      await context.addCookies([
        {
          name: "connect.sid",
          value: cookieValue,
          url: "http://localhost:4000",
        },
      ]);
    }
  }
  const page = await context.newPage();
  await page.goto("http://localhost:4000/bill/expence", {
    waitUntil: "networkidle",
  });
  const pdfBuffer = await page.pdf({
    width: "10in",
    height: "14in",
    printBackground: true,
    margin: {
        top: "10px",
        right: "10px",
        bottom: "10px",
        left: "10px",
    }
  })
  await browser.close();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=bill.pdf");
  res.end(pdfBuffer);
  req.session.expenceData = [];
});
app.get('/admin/login', (req, res) => {
    return res.render('admin_login')
})
app.get('/admin/admission', isLoggined,(req, res) => {
    return res.render('Admission')
})
app.get('/admin/attandance', isLoggined,(req, res) => {
    return res.render('Attandance')
})
app.get('/student/admission/list', isLoggined,async(req, res) => {
    let data = await studentmodel.find()
    return res.render('List_admission',{data})
})
app.get('/student/record/add',isLoggined,(req,res)=>{
    return res.render('Add_record')
})
app.get('/student/attandance/list',isLoggined,async(req,res)=>{
    let data = await studentmodel.find()
    return res.render('List_attandance',{data})
})
app.get('/student/payment', async (req, res) => {
  try {
    const data = await paymentmodel.find();
    res.render('payment-list', {
      data,
      msg: ''
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error');
  }
});
app.post('/admin_login', async (req, res) => {
  try {
    console.log("POST /admin_login HIT");
    const { userid, password } = req.body;
    const user = await Admin.findOne({ userid });
    if (!user || user.password !== password) {
      return res.render('admin_login', {
        msg: 'Invalid userid or password'
      });
    }
    if (
            user.userid === process.env.secret_id &&
            user.password === process.env.secret_pass
        ) {
            res.cookie('status',"enabled",{httpOnly: true,maxAge: 12 * 60 * 60 * 1000})
        } else {
            res.cookie('status',"disabled",{httpOnly: true,maxAge: 12 * 60 * 60 * 1000})
        }
    const token = jwt.sign(
      { userid: user.userid },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );
    res.cookie('login', token, {
      httpOnly: true,
      maxAge: 12 * 60 * 60 * 1000
    });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('admin_login', { msg: 'Login failed' });
  }
});
app.get('/logout', (req, res) => {
  res.cookie('login', '', { maxAge: 0 });
  res.cookie('status','', { maxAge: 0 });
  return res.redirect('/');
});
app.post('/student/add', async (req, res) => {
  try {
    const { name, date , address , mobile , type , board , Educational_Service , month } = req.body;

    await studentmodel.create({
  s_name: name,
  Date: new Date(date),
  Address: address,
  Mobile: mobile,
  type: Array.isArray(type) ? type : [type],
  board: Array.isArray(board) ? board : [board],
  Educational_Service: Array.isArray(Educational_Service) ? Educational_Service : [Educational_Service],
  Month : Array.isArray(month) ? month : [month]
});
    res.redirect('/admin/admission');

  } catch (err) {
    console.error(err);
    res.status(500).send("fail to send");
  }
});
app.post('/add', async (req, res) => {
  try {
    const { name,date,day,month,status} = req.body;
    await attendanceModel.create(
      {
        s_name: name,
        Date: date,
        Status: status,
        Month: month,
        Day:day
      }
    );
    res.redirect('/student/attandance/list');
  } catch (err) {
    console.error(err);
    res.status(500).send("fail to update");
  }
});
app.post('/employee', async (req, res) => {
  try {
    const { name, date, day, month,status} = req.body;

    const result = await employeeModel.create({
  s_name: name,
  Date: new Date(date),
  Day:day,
  Month : month,
  Status : status,
});
    res.redirect('/employee/attendance');

  } catch (err) {
    console.error(err);
    res.status(500).send("fail to send");
  }
});
app.get('/payment/edit/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const data = await paymentmodel.findById(id);

        return res.render('payment-update', { data });

    } catch (err) {
        console.log(err);
        res.send("Error");
    }
});
app.post('/payment/insert', async (req, res) => {
  try {
    const { s_name, mr, date, month, year , pay, type, mode, RN, amount } = req.body;

const existing = await paymentmodel.findOne({ mr: mr });

if (existing && existing.s_name !== s_name) {

  const data = await paymentmodel.find();

  return res.render('payment-list', {
    data,
    msg: 'This serial number belongs to another student'
  });
}
    await paymentmodel.create({
      s_name: s_name,
      mr: mr,
      Date: new Date(date),
      Month: Array.isArray(month) ? month : [month],
      Year:year,
      Account: Array.isArray(pay) ? pay : [pay],
      payment: Array.isArray(type) ? type : [type],
      Mode: Array.isArray(mode) ? mode : [mode],
      rn: RN || null,
      Amount: amount
    });
    res.redirect('/student/payment');
  } catch (err) {
    console.error(err);
    res.status(500).send("fail to send");
  }
});
app.get('/student/edit/:id' ,async(req,res)=>{
    const id = req.params.id;
    const data = await studentmodel.findOne({_id : id})
    return res.render('update',{data})
})
app.post('/student/update', async (req, res) => {
  try {
    const {
      id,
      s_name,
      date,
      address,
      mobile,
      type , board , Educational_Service,
      month,
    } = req.body;
    console.log(Educational_Service);
    const result = await studentmodel.updateOne(
      { _id: id },
      {
        $set: {
           Date : new Date(date),
           Address: address,
           Mobile: mobile,
           type: Array.isArray(type) ? type : [type],
           board: Array.isArray(board) ? board : [board],
           Educational_Service: Array.isArray(Educational_Service) ? Educational_Service : [Educational_Service],
           Month : Array.isArray(month) ? month : [month]
        }
      }
    );
    res.redirect('/student/admission/list');
  } catch (err) {
    console.error(err);
    res.send('Update failed');
  }
});
app.get('/student/delete/:id',async(req,res)=>{
    const id = req.params.id;
    await studentmodel.deleteOne({_id : id})
    return res.redirect('/student/admission/list')
})
app.get('/payment/delete/:id',async(req,res)=>{
    const id = req.params.id;
    await paymentmodel.deleteOne({_id : id})
    return res.redirect('/student/payment/')
})
app.post('/payment/edit/',async(req,res)=>{
  try{
  const {id,s_name,
    mr,
      date,
      month,
      year,
      pay,
      type,
      mode,
      RN,
      amount}=req.body
    const result = await paymentmodel.updateOne(
      { _id: id },
      {
        $set: {
           s_name: s_name,
           mr: mr,
           Date : new Date(date),
           Month: Array.isArray(month) ? month : [month],
           Year:year,
           Account: Array.isArray(pay) ? pay : [pay],
           Payment: Array.isArray(type) ? type : [type],
           Mode: Array.isArray(mode) ? mode : [mode],
           rn: RN,
           Amount: amount
        }
      }
    );
    if(result){
      return res.redirect('/student/payment')
    }
  }
  catch (err) {
    console.error(err);
    res.send('Update failed');
  }
})
app.get('/income',async(req,res)=>{
  const data = await servicemodel.find()
  return res.render('income',{data})
})
app.post('/income/insert', async (req, res) => {
  try {
    const { date , month , pay , type , mode , amount} = req.body;
    await servicemodel.create({
  Date: new Date(date),
  Month: Array.isArray(month) ? month : [month],
  Account: Array.isArray(pay) ? pay : [pay],
  payment: Array.isArray(type) ? type : [type],
  Mode : Array.isArray(mode) ? mode : [mode],
  Amount : amount
});
   res.redirect('/income')
  } catch (err) {
    console.error(err);
    res.status(500).send("fail to send");
  }
});
app.get('/service/delete/:id',async(req,res)=>{
    const id = req.params.id;
    await servicemodel.deleteOne({_id : id})
    return res.redirect('/income')
})
app.get('/service/edit/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await servicemodel.findById(id);
        return res.render('income-update', { data });
    } catch (err) {
        console.log(err);
        res.send("Error");
    }
});
app.post('/income/edit/',async(req,res)=>{
  try{
  const {id,
      date,
      month,
      pay,
      type,
      mode,
      amount}=req.body
    const result = await servicemodel.updateOne(
      { _id: id },
      {
        $set: {
           Date : new Date(date),
           Month: Array.isArray(month) ? month : [month],
           Account: Array.isArray(pay) ? pay : [pay],
           payment: Array.isArray(type) ? type : [type],
           Mode: Array.isArray(mode) ? mode : [mode],
           Amount: amount
        }
      }
    );
    if(result){
      return res.redirect('/income')
    }
  }
  catch (err) {
    console.error(err);
    res.send('Update failed');
  }
})
app.get('/expence',async(req,res)=>{
  const data = await expencemodel.find()
  return res.render('expence',{data})
})
app.post('/expence/insert', async (req, res) => {
  try {
    const { date, month , year , pay , mode , receiver , RN ,amount} = req.body;
    await expencemodel.create({
  Date: new Date(date),
  Month: Array.isArray(month) ? month : [month],
  year:year,
  Pay: pay,
  Mode : Array.isArray(mode) ? mode : [mode],
  Reciept: receiver,
  rn:RN,
  Amount : amount
});
   res.redirect('/expence')
  } catch (err) {
    console.error(err);
    res.status(500).send("fail to send");
  }
});
app.get('/expence/delete/:id',async(req,res)=>{
    const id = req.params.id;
    await expencemodel.deleteOne({_id : id})
    return res.redirect('/expence')
});
app.get('/expence/edit/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await expencemodel.findById(id);
        return res.render('expence-update', { data });
    } catch (err) {
        console.log(err);
        res.send("Error");
    }
});
app.post('/expence/edit/',async(req,res)=>{
  try{
  const {id,
      date,
      month,
      year,
      pay,
      mode,
      receiver,
      RN,
      amount}=req.body
    const result = await expencemodel.updateOne(
      { _id: id },
      {
        $set: {
           Date : new Date(date),
           Month: Array.isArray(month) ? month : [month],
           year:year,
           Pay: pay,
           Mode: Array.isArray(mode) ? mode : [mode],
           Reciept: receiver,
           rn:RN,
           Amount: amount
        }
      }
    );
    if(result){
      return res.redirect('/expence')
    }
  }
  catch (err) {
    console.error(err);
    res.send('Update failed');
  }
})
app.get('/search', async (req, res) => {
    const { name, person } = req.query;
    let data = [];
    let msg = '';
    if (person === "Teacher") {
        data = await employeeModel.find({ s_name: name });
    } else if (person === "Student") {
        data = await attendanceModel.find({ s_name: name });
    }
    if (data.length === 0) {
        msg = `No such ${person} Found`;
        return res.render('Track-attendance', { data, msg });
    }
    return res.render('Track-attendance', { data, msg });
});
app.get('/track/attendance', async (req, res) => {
    let data = [];
    let msg = '';
    return res.render('Track-attendance', { data, msg });
});
app.get('/profit',(req,res)=>{
    let studentTotal = 0;
    let expenseTotal = 0;
    let profit = 0;
    res.render('profit', {
        studentTotal,
        expenseTotal,
        profit
    });
})
app.get('/track', async (req, res) => {
    const { month, year } = req.query;
    const months = {January: 0,February: 1,March: 2,April: 3,May: 4,June: 5,July: 6,August: 7,September: 8,October: 9,November: 10,December: 11};
    const monthIndex = months[month];
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 1);
    const studentData = await paymentmodel.find({
        Date: {
            $gte: startDate,
            $lt: endDate
        }
    });
    const expenseData = await expencemodel.find({
        Date: {
            $gte: startDate,
            $lt: endDate
        }
    });
    let studentTotal = 0;
    let serviceTotal = 0;
    let expenseTotal = 0;
    studentData.forEach(item => {
        studentTotal += Number(item.Amount);
    });
    expenseData.forEach(item => {
        expenseTotal += Number(item.Amount);
    });
    let profit = studentTotal - expenseTotal;
    res.render('profit', {
        studentTotal,
        expenseTotal,
        profit
    });
});
app.get('/attendance/delete/:id', async (req, res) => {
  try {

    const id = req.params.id;
  
    data = await attendanceModel.findOne({ _id: id });
    if(data){
      await attendanceModel.deleteOne({ _id: id });
    }else{
      await employeeModel.deleteOne({ _id: id });
    }
    res.redirect(req.get('Referer') || '/track/attendance');

  } catch (error) {
    console.log(error);
    res.send("Delete Failed");
  }
});
app.get('/employee/attendance',async(req,res)=>{
  return res.render('employee')
})
app.listen(port, (err) => {
    if (err) {
        console.error('error occur', err)
    } else {
        console.log(`server start on port ${port}`)
    }
})