/* eslint-disable max-len */
// /* eslint-disable max-len */
const updateEmailHtmlContent = (
  firstName: string,
) => {
  const htmlTemplate = `<!DOCTYPE html>
         <html>
           <head>
             <meta charset="utf-8">
             <title>Your account e-mail has been updated</title>
             <style>
               #body {
                 font-family: Arial, sans-serif;
                 font-size: 15px;
                 background-color: #f2f2f2;
                 padding: 10px;
               }
               .container {
                 background-color: white;
                 padding: 10px;
                 border-radius: 5px;
                 box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
               }
               h1 {
                 color: #333;
               }
               #body p {
                 color: #222020;
                 margin: 5px;
               }
               #btn {
                 display: inline-block;
                 background-color: #4c68af;
                 color: #ffffff;;
                 padding: 10px 20px;
                 text-decoration: none;
                 border-radius: 5px;
               }
               #btn:hover {
                 background-color: #394e82;
               }
               #psw {
                 background-color: #caedf1;
               }
             </style>
           </head>
           <body id="body">
             <div class="container">
               <h1>Hello, ${firstName}!</h1>
               <p>You successfully updated your email address on Edulab.</p>
               <p>If you did not make this change, please contact our support team.</p>
             </div>
           </body>
         </html>`;

  return htmlTemplate;
};

export default updateEmailHtmlContent;
