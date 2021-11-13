const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const sendWelcomeEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from:'mostafanasr1794@gmail.com',
        subject:'Welcome',
        text:`Welcome to my app, ${name}`
    })
}
const sendUserDeleteEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from:'mostafanasr1794@gmail.com',
        subject:'Report',
        text:`May we  ask why you delete your account, ${name}`
    })
}


module.exports={
    sendWelcomeEmail,
    sendUserDeleteEmail
}