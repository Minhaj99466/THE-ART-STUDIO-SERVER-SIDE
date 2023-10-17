import nodemailer from 'nodemailer'

const sendMail=async(email,subject,text)=>{
    try {
        const transport = nodemailer.createTransport({
            host:process.env.HOST,
            service:process.env.SERVICE,
            post:process.env.EMAIL_PORT,
            secure:false,
            auth:{
                user:process.env.USER,
                pass:process.env.PASS
            }
        })

        await transport.sendMail({
            from:process.env.USER,
            to:email,
            subject:subject,
            text:text
        }).then(()=> console.log("email send successfully"))
       
    } catch (error) {
        console.log("email not send");
        console.log(error);
    }
}
export default sendMail