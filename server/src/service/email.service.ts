import * as dotenv from "dotenv";
import sgMail from "@sendgrid/mail";

dotenv.config();

// Thiết lập API Key từ biến môi trường
sgMail.setApiKey(process.env.EMAIL_API_KEY as string);

// Lấy thời gian hiện tại định dạng Việt Nam
const now = new Intl.DateTimeFormat("vi-VN", {
  weekday: "long",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
}).format(new Date());

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
        .header { background-color: #2d5a27; color: #ffffff; padding: 20px; text-align: center; }
        .content { padding: 30px; text-align: center; }
        .time-badge { background-color: #f0f7ef; border: 1px solid #2d5a27; color: #2d5a27; padding: 10px; border-radius: 5px; display: inline-block; margin: 15px 0; font-weight: bold; }
        .footer { background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #777; }
        .button { background-color: #4caf50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0;">Tree-Caring Project</h1>
        </div>
        <div class="content">
            <h2 style="color: #2d5a27;">Cây của bạn đã được uống nước! 🌳</h2>
            <p>Chào bạn, chúng mình vừa hoàn thành việc chăm sóc định kỳ cho cây xanh của bạn.</p>
            
            <div class="time-badge">
                Thời gian tưới: ${now}
            </div>

            <p>Trạng thái: <strong>Khỏe mạnh & Đủ độ ẩm</strong></p>
            
           </div>
        <div class="footer">
            <p>Cảm ơn bạn đã góp phần vì một môi trường xanh sạch đẹp!</p>
            <p>© 2025 Tree-Caring Team</p>
        </div>
    </div>
</body>
</html>
`;

// get user email from database or configuration

export const sendEmailToUser = async (
  userEmail: string,
  subject?: string,
  html?: string
) => {
  const msg = {
    to: userEmail,
    from: "thai37205@gmail.com",
    subject:
      subject ||
      "[Tree-Caring] Thông báo: Cây của bạn đã được chăm sóc thành công",
    text: `Cây của bạn trong dự án Tree-Caring đã được tưới vào lúc ${now}. Truy cập website để xem chi tiết.`,
    html: html || htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log(`Đã gửi email tới ${userEmail}`);
  } catch (error) {
    console.error("Lỗi gửi email:", error);
  }
};
