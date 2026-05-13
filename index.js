const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const jwt = require('jsonwebtoken')
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

mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log('mongodb connect')
}).catch((err)=>{
    console.log('mongodb conection error',err)
})
app.get('/', isLoggined,(req, res) => {
    return res.render('home')
})

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
app.get('/user/token/login', isLoggined,(req, res) => {
    return res.render('login_token')
})
app.get('/student/record/add',isLoggined,(req,res)=>{
    return res.render('Add_record')
})
app.get('/student/attandance/list',isLoggined,async(req,res)=>{
    let data = await studentmodel.find()
    return res.render('List_attandance',{data})
})
app.get('/student/payment',async(req,res)=>{
  let data = await paymentmodel.find();
    return res.render('payment-list',{data})
})
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
  return res.redirect('/');
});
app.get('/admin/user/token',(req,res)=>{
    return res.render('usertoken')
})
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
    const { name, date, status, month} = req.body;

    const result = await employeeModel.create({
  s_name: name,
  Date: new Date(date),
  status : Array.isArray(status) ? status : [status],
  Month : Array.isArray(month) ? month : [month]
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
    const { s_name, date, pay , type , mode , amount} = req.body;

    await paymentmodel.create({
  s_name: s_name,
  Date: new Date(date),
  Account: Array.isArray(pay) ? pay : [pay],
  payment: Array.isArray(type) ? type : [type],
  Mode : Array.isArray(mode) ? mode : [mode],
  Amount : amount
});
   res.redirect('/student/payment')
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
      course,
      month,
    } = req.body;

    const result = await studentmodel.updateOne(
      { _id: id },
      {
        $set: {
           Date : new Date(date),
           Address: address,
           Mobile: mobile,
           course: Array.isArray(course) ? course : [course],
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
app.get('/student/attendance/delete/:id',async(req,res)=>{
    const id = req.params.id;
    await attandancemodel.deleteOne({_id : id})
    return res.redirect('/student/attandance/list')
})
app.get('/employee/delete/:id',async(req,res)=>{
    const id = req.params.id;
    await employeeModel.deleteOne({_id : id})
    return res.redirect('/employee/attendance')
})
app.get('/employee/attendance',async(req,res)=>{
    const data = await employeeModel.find()
    return res.render('employee',{data})
})
/*app.get('/payment/edit/:id',async(req,res)=>{
    const 
})*/
app.get('/student/attendance/:id',async(req,res)=>{
  const id = req.params.id
  const data = await attandancemodel.findOne({_id:id})
  return res.render('update-student-attendance',{data})
})
app.get('/employee/edit/:id',async(req,res)=>{
  const id = req.params.id
  const data = await employeeModel.findOne({_id:id})
  return res.render('update-employee-attendance',{data})
})
app.post('/payment/edit/',async(req,res)=>{
  try{
  const {s_name,
      date,
      pay,
      type,
      mode,
      details,
      amount}=req.body
    const result = await paymentmodel.updateOne(
      { s_name: s_name },
      {
        $set: {
           Date : new Date(date),
           Account: Array.isArray(pay) ? pay : [pay],
           Payment: Array.isArray(type) ? type : [type],
           Mode: Array.isArray(mode) ? mode : [mode],
           Detail: details,
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
app.post('/student/attendance/update',async(req,res)=>{
  try{
  const {id,name,
      date,
      status,
      month
    }=req.body
    const result = await attandancemodel.updateOne(
      { _id: id },
      {
        $set: {
           Date : new Date(date),
           status: Array.isArray(status) ? status : [status],
           Month: Array.isArray(month) ? month : [month]
        }
      }
    );
    if(result.matchedCount != 0){
      return res.redirect('/student/attandance/list')
    }
  }
  catch (err) {
    console.error(err);
    res.send('Update failed');
  }
})
app.post('/employee/attendance/update',async(req,res)=>{
  try{
  const {id,name,
      date,
      status,
      month
    }=req.body
    const result = await employeeModel.updateOne(
      { _id: id },
      {
        $set: {
           Date : new Date(date),
           status: Array.isArray(status) ? status : [status],
           Month: Array.isArray(month) ? month : [month]
        }
      }
    );
    if(result.matchedCount != 0){
      return res.redirect('/employee/attendance')
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
    const { date, pay , type , mode , amount} = req.body;

    await servicemodel.create({
  Date: new Date(date),
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
      pay,
      type,
      mode,
      amount}=req.body
    const result = await servicemodel.updateOne(
      { _id: id },
      {
        $set: {
           Date : new Date(date),
           Account: Array.isArray(pay) ? pay : [pay],
           Payment: Array.isArray(type) ? type : [type],
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
    const { date, month , pay , mode ,receiver, amount} = req.body;

    await expencemodel.create({
  Date: new Date(date),
  Month: Array.isArray(month) ? month : [month],
  Pay: pay,
  Mode : Array.isArray(mode) ? mode : [mode],
  Reciept: receiver,
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
      pay,
      mode,
      receiver,
      amount}=req.body
    const result = await expencemodel.updateOne(
      { _id: id },
      {
        $set: {
           Date : new Date(date),
           Month: Array.isArray(month) ? month : [month],
           Pay: pay,
           Mode: Array.isArray(mode) ? mode : [mode],
           Reciept: receiver,
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
app.listen(port, (err) => {
    if (err) {
        console.error('error occur', err)
    } else {
        console.log(`server start on port ${port}`)
    }
})