const express=require('express');
const bodyParser=require('body-parser');
const session=require('express-session');
const passwordHash=require('password-hash');
var app=express();
app.use(express.static("static"));
app.use(bodyParser.urlencoded({extended: true}));
const MongoClient=require('mongodb');
 const mongoose = require('mongoose');
 app.use(session({
 	secret: "Shh,its a secret!",
 	resave:true,
	saveUninitialized:true
 }));
// mongoose.connect('mongodb+srv://Meghana:FhgvaYgUQBS9qy27@cluster0.gmuee.mongodb.net/todo?retryWrites=true&w=majority',{useNewUrlParser: true,useUnifiedTopology: true});
mongoose.connect('mongodb://localhost:27017/todo', {useNewUrlParser: true,useUnifiedTopology: true});

 var tasks=['assignment','Script writing'];

	

app.set('view engine','ejs');

 const listSchema = new mongoose.Schema({
  item: String,
  user:{type:String, ref: ''},
  duedate: 
  		{
		type: Date,
		default: Date.now
		}
  
},{timestamps:
{
	createdAt: 'created_at',
	updatedAt: 'updated_at'
}
});

 const List = mongoose.model('List', listSchema);

  const userSchema = new mongoose.Schema({
 	name: String,
 	username: {type: String,unique: true},
 	password: String,
 
});

 const User = mongoose.model('User', userSchema);
 app.get('/',function(req,res){
	if(req.session.username){
		// res.json({
		// 	session: req.session,
		// })
		List.find({user: req.session.uid},(err,tasks)=>{
			res.render('index',{tasks:tasks});
		}).sort({created_at: -1});
	
	} else res.redirect('/login')
	 	});
 app.get('/login',function(req,res){
	res.render('login');
});
app.post('/login',function(req,res){
	User.findOne({username:req.body.username},(err,user)=>{
		if(err) res.send("error");
		// console.log(passwordHash.verify(req.body.password,user.password));
		 else if(passwordHash.verify(req.body.password,user.password)){
		 	console.log(passwordHash.verify(req.body.password,user.password));
			req.session.username=user.username;
			req.session.name=user.name;
			req.session.uid=user._id;
			res.redirect('/');
		}else{
			res.send("incorrect username or password");
		}
	})
});
app.get('/register',function(req,res){
	res.render('register');
});
app.post('/register',function(req,res){
// 	res.json({
// 		body:req.body,
// 	});
	let newUser=new User({
		name: req.body.name,
		username: req.body.username,
		password: passwordHash.generate(req.body.password),
	}).save((err)=>{
		if(err) res.send("Username already exists");
		else res.redirect('/login');
	});
 })
app.post('/add',function(req,res){
		new List({
		item: req.body.item,
		user: req.session.uid,
		duedate: req.body.duedate,
		// password: passwordHash.generate(req.body.password),
	}).save((err)=>{
		if(err) res.send("error");
		else res.redirect('/');
	});
});
app.route('/remove/:id').get((req,res)=>{
	 const id=req.params.id;
	List.findByIdAndRemove(id,err => {
		if(err){
			return res.send(500,err);
		}res.redirect('/')
	});
});
app.route('/edit/:id').get((req,res)=>{
	const id=req.params.id;
	List.find(id,(err,tasks)=>{
		res.render("index.ejs",{
			tasks:tasks,
			idTask:id
		});
	});
});
// app.get('/edit/:id',(req,res)=>{
// 	const id=req.params.id;
// 	List.find(id,(err,tasks)=>{
// 	res.render('edit',{tasks:tasks});
// 	})
// })
app.post('/edit/:id',(req,res)=>{
	const id=req.params.id;
	List.findByIdAndUpdate(id,{item:req.body.item},err=>{
		if(err) return res.send(500,err);
		res.redirect("/");
	});
})

 app.get('/logout',function(req,res){
 	req.session.destroy();
 	res.redirect('/login');
 });
app.listen(3001,function(){
	console.log("server running on port 3001");
});