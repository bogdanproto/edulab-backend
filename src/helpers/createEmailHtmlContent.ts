/* eslint-disable max-len */
// /* eslint-disable max-len */
const createEmailHtmlContent = (firstName: string, activationLink: string) => {
  const htmlTemplate = `<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <title>Activate Your Account</title>
  <style>
    #body {
      font-family: Arial, sans-serif;
      font-size: 16px;
      padding-bottom: 10px;
      padding-left: 10px;
      padding-right: 10px;
    }

    h1 {
      padding: 0;
      margin-bottom: 8px;
      color: #333;
    }

    #body p {
      padding: 0;
      margin-top: 6px;
      margin-bottom: 6px;
      color: #222020;
    }

    #btn {
      margin-top: 12px;
      margin-bottom: 12px;
      width: 160px;
      display: block;
      background-color: #4c68af;
      color: #ffffff;
      text-align: center;
      padding: 8px 10px;
      text-decoration: none;
      border-radius: 5px;
      font-family: Arial, sans-serif;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 1.2;
    }

    #btn:hover {
      background-color: #1942a9;
    }
  </style>
</head>

<body id="body">
  <h1>Welcome, ${firstName}!</h1>
  <p>You have been registered on the Edulab educational platform.</p>
  <p>To activate your account, please click the account activation button below. You will be redirected to the
    password set page to create your oun own portal access password.</p>
  <a href="${activationLink}" id="btn">ACTIVATE ACCOUNT</a>
  <p>If you were not expecting to register on the edulab portal, please ignore this message.</p>
</body>

</html>`;

  return htmlTemplate;
};

export default createEmailHtmlContent;
