const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

app.use(express.json());

//Regex
var regEXname = /^[a-zA-Z]+$/;
var regEeMID = /[a-zA-Z0-9]+@northeastern.edu+$/;
//Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character:
var regPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

mongoose.connect('mongodb+srv://jarvisak:Pa55w0rd@cluster0.dmguzhb.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if (!err) {
        console.log("Connected to DB")
    }
    else {
        console.log("Error connecting to DB" + err)
    }
});
// Schema
const sch = {
    firstname: String,
    email: String,
    password: String
}
const monmodel = mongoose.model("NEWCOLLECTION", sch);
//POST
app.post("/user/create", async (req, res) => {

    console.log("Inside Post Function");
    var flag = regexCheck(req);
    console.log("Regec Flag ===========================================" + flag);
    if (flag == 0)
    {
        try {
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
            console.log("salt =>" + salt);
            console.log("hashedPassword =>" + hashedPassword);
    
            const data = new monmodel({
                firstname: req.body.firstname,
                email: req.body.email,
                password: hashedPassword
    
            });
    
            const val = await data.save();
            res.json(val);
            console.log(val);
    
        }
        catch
        {
            console.log("In the catch block");
        }
    }
    else if(flag == 1)
    {
        res.send("Name Regex Failed... please enter First name with only Alphabets");
    }
    else if(flag == 2)
    {
        res.send("Email Regex Failed... please enter your Northeastern Email address");
    }
    else if(flag == 3)
    {
        res.send("Password Regex Failed... please enter a Minimum of eight characters with at least one uppercase letter, one lowercase letter, one number and one special character");
    }
    else{
        /*Do Nothing */
    }
    


});

//PUT
app.put("/user/edit/:email", async (req, res) => {
    let upemail = req.params.email;

    console.log("Inside Put Function");
    var flag = regexChecknoEmail(req);
    console.log("Regec Flag ===========================================" + flag);
    if (flag == 0)
    {
        try {
            console.log("----------------------------------------In TRY");
            const salt = await bcrypt.genSalt();
            let hashedPassword = await bcrypt.hash(req.body.password, salt);
    
            let upfirstname = req.body.firstname;
    
    
            //find emailID and update Firstname and password
            monmodel.findOneAndUpdate({ email: upemail }, { $set: { firstname: upfirstname, password: hashedPassword } },
                { new: true }, (err, data) => {
                    if (err) {
                        res.send("Error =>" + err)
                    }
                    else {
                        if (data == null) {
                            res.send(upemail + " is not found in the Database. Please check the email again and try again");
                        }
                        else {
                            res.send(data);
                        }
                    }
    
                });
        }
        catch
        {
            console.log("In the catch block");
        }

    }
    else if(flag == 1)
    {
        res.send("Name Regex Failed... please enter First name with only Alphabets");
    }
    else if(flag == 3)
    {
        res.send("Password Regex Failed... please enter a Minimum of eight characters with at least one uppercase letter, one lowercase letter, one number and one special character");
    }
    else{
        res.send("In ELSE");
    }


});

//Fetch Get data with reference of the email address

/*app.get('/fetch/:email', function (req, res) {
    fetchemail = req.params.email;

    monmodel.find({ email: fetchemail }, function (err, val) {
        if (err) {
            res.send("Error =>" + err);
        }
        else {
            if (val.length == 0) {
                res.send("Data does not exist");
            }
            else {
                res.send(val);
            }

        }

    });
});*/

//Fetch Get all the data in mongo db database
app.get('/user/getAll', (req, res) => {
    monmodel.find((err, val) => {
        if (err) {
            console.log("Error =>" + err);
            res.send("Error =>" + err);
        }
        else {
            res.json(val);
        }
    });
});

//Delete with help of Email
app.delete('/user/delete/:email', function (req, res) {

    let delemail = req.params.email;
    monmodel.findOneAndDelete({ email: delemail }, function (err, data) {
        if (err) {
            console.log("Error =>" + err);
            res.send("Error =>" + err);
        }
        else {
            if (data == null) {
                res.send("Wrong Email Address... " +
                    "The data corresponding to the email address is either deleted or not present in the Database");
            }
            else {
                res.send(data + "\n the above data has been Deleted");
            }


        }
    });
})

function regexCheck(request)
{
    var flag = 0;
    if (request.body.firstname.trim().match(regEXname)){
        console.log("Name regex Successfull");
        if (request.body.email.trim().match(regEeMID)) {
            console.log("Email regex Successfull");
            if (request.body.password.trim().match(regPassword)) {
                console.log("Password regex Successfull");
            }
            else{
                flag = 3;//denotw that Password regex failed
                console.log("Password regex unsuccessfull");
            }
        }
        else{
            flag = 2;//denotw that Email regex failed
            console.log("Email regex unsuccessfull");
        }
    }
    else{
        flag = 1;//denotw that Name regex failed
        console.log("Name regex unsuccessfull");
    }
    return flag;
}

function regexChecknoEmail(request)
{
    var flag = 0;
    if (request.body.firstname.trim().match(regEXname)){
        console.log("Name regex Successfull");
            if (request.body.password.trim().match(regPassword)) {
                console.log("Password regex Successfull");
            }
            else{
                flag = 3;//denotw that Password regex failed
                console.log("Password regex unsuccessfull");
            }
       }
       else{
            flag = 1;//denotw that Name regex failed
            console.log("Name regex unsuccessfull");
        }
    return flag;
}



app.listen(3000, () => {
    console.log("on port")
});