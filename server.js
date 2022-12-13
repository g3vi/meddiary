import express from "express"
import bcrypt from "bcrypt"
import {initializeApp} from 'firebase/app'
import {getDoc, getFirestore, setDoc, collection, doc, updateDoc, getDocs, query, where } from 'firebase/firestore'
// configuracion para firebase
const firebaseConfig = {
    apiKey: "AIzaSyD_sZvCZIzoptuWyplb2NmwJHTO_H780bQ",
    authDomain: "agenda-medica-af8c8.firebaseapp.com",
    projectId: "agenda-medica-af8c8",
    storageBucket: "agenda-medica-af8c8.appspot.com",
    messagingSenderId: "486631820818",
    appId: "1:486631820818:web:b0e0bbe70298ed267d52cb"
  };
const firebase = initializeApp(firebaseConfig);
const db=getFirestore()
const app=express()

app.use(express.static('public'))
app.use(express.json())

// Rutas
// Home
app.get('/',(req,res) => {
    res.sendFile('index.html',{root:'public'})
})
// Ruta para registro
app.get('/signup',(req,res) => {
    res.sendFile('signup.html',{root: 'public'})
})
app.post('/signup',(req,res) => {
    const { name, email, password, number, tac } = req.body
    console.log(req.body)
    // Validaciones
    if(name.length <3){
        res.json({ 'alert': 'name must be 3 letters long'})
    } else if (!email.length) {
        res.json({'alert': 'enter your email'})
    }else if (password.length < 8) {
        res.json({'alert': 'password must be 8 letters long'})
    }else if (!Number(number) || number.length < 10 ) {
        res.json({'alert': 'invalid number, please enter valid one'})
    }else {
        // Almacenar datos en BD
        const users = collection(db,"users")
        getDoc(doc(users,email)).then(user => {
            if(user.exists()){
            res.json({'alert': 'email already exists'})
            }else {
                //encriptar password
                bcrypt.genSalt(10,(err,salt)=> {
                    bcrypt.hash(password, salt, (err, hash) => {
                        req.body.password = hash
                        req.body.seller = false
                        setDoc(doc(users, email), req.body).then(data =>{
                            res.json({
                                name: req.body.name,
                                email: req.body.email
                            })
                        })
                    })
                })
            }
        })
    }
})

// Ruta Log in

app.get('/login',(req,res) => {
    res.sendFile('login.html',{root: 'public'})
})
app.post('/login',(req,res) => {
    let { email, password } = req.body
    console.log('login', email,password)
    if ( !email.length || !password.length){
        return res.json({
            'alert': 'fill all the inputs'
        })
    }   
    const users = collection(db, 'users')
    getDoc(doc(users, email))
        .then( user => {
            if(!user.exists()) {
                return res.json({
                    'alert': 'fill all the inputs'
                })
            }else {
                bcrypt.compare(password,user.data().password,(err,result) => {
                    if (result) {
                        let data = user.data()
                        return res.json({
                            name: data.name,
                            email: data.email
                        })
                    } else {
                        return res.json({'alert': 'incorrect password'})
                }
            })
        }
    })
})

app.listen(8080,()=>{
    console.log('Servidor ejecutandose')
})