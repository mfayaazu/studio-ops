package com.studioops.email;

import com.studioops.user.User;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import java.time.Instant;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final SystemEmailLogService emailLogService;

    @Value("${studioops.email.enabled:false}")
    private boolean enabled;

    @Value("${studioops.email.from:no-reply@studioops.photo}")
    private String fromAddress;

    @Value("${studioops.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender, SystemEmailLogService emailLogService) {
        this.mailSender = mailSender;
        this.emailLogService = emailLogService;
    }

    public void sendEmployeeInviteEmail(User user, String studioName, String inviteToken) {
        String subject = "Invitation to join " + studioName + " on StudioOps";
        String inviteUrl = frontendUrl + "/#/accept-invite?token=" + inviteToken;
        
        String htmlContent = "<div style=\"font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0b0f19; color: #f8fafc; border-radius: 8px;\">" +
                "<h2 style=\"color: #a78bfa;\">Welcome to StudioOps!</h2>" +
                "<p>Hello " + (user.getDisplayName() != null ? user.getDisplayName() : "") + ",</p>" +
                "<p>You have been invited to join the studio <strong>" + studioName + "</strong> on StudioOps as a <strong>" + user.getRole().name() + "</strong>.</p>" +
                "<p>To set up your password and activate your account, please click the button below:</p>" +
                "<div style=\"margin: 30px 0; text-align: center;\">" +
                "<a href=\"" + inviteUrl + "\" style=\"background-color: #7c3aed; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;\">Activate Account</a>" +
                "</div>" +
                "<p style=\"font-size: 12px; color: #94a3b8;\">If the button above does not work, copy and paste this link in your browser:</p>" +
                "<p style=\"font-size: 12px; color: #a78bfa; word-break: break-all;\">" + inviteUrl + "</p>" +
                "<hr style=\"border: none; border-top: 1px solid #1e293b; margin: 20px 0;\">" +
                "<p style=\"font-size: 11px; color: #64748b;\">This invitation link will expire in 48 hours.</p>" +
                "</div>";

        sendEmail(user, "EMPLOYEE_INVITE", subject, htmlContent);
    }

    public void sendPasswordResetEmail(User user, String resetToken) {
        String subject = "Reset your StudioOps Password";
        String resetUrl = frontendUrl + "/#/reset-password?token=" + resetToken;

        String htmlContent = "<div style=\"font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0b0f19; color: #f8fafc; border-radius: 8px;\">" +
                "<h2 style=\"color: #a78bfa;\">Password Reset Request</h2>" +
                "<p>Hello " + (user.getDisplayName() != null ? user.getDisplayName() : "") + ",</p>" +
                "<p>We received a request to reset your password for your StudioOps account.</p>" +
                "<p>To reset your password, please click the button below:</p>" +
                "<div style=\"margin: 30px 0; text-align: center;\">" +
                "<a href=\"" + resetUrl + "\" style=\"background-color: #7c3aed; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;\">Reset Password</a>" +
                "</div>" +
                "<p style=\"font-size: 12px; color: #94a3b8;\">If the button above does not work, copy and paste this link in your browser:</p>" +
                "<p style=\"font-size: 12px; color: #a78bfa; word-break: break-all;\">" + resetUrl + "</p>" +
                "<hr style=\"border: none; border-top: 1px solid #1e293b; margin: 20px 0;\">" +
                "<p style=\"font-size: 11px; color: #64748b;\">This password reset link will expire in 1 hour. If you did not request this, you can safely ignore this email.</p>" +
                "</div>";

        sendEmail(user, "PASSWORD_RESET", subject, htmlContent);
    }

    private void sendEmail(User user, String emailType, String subject, String body) {
        SystemEmailLog emailLog = new SystemEmailLog();
        emailLog.setStudioId(user.getStudioId());
        emailLog.setUserId(user.getId());
        emailLog.setRecipient(user.getEmail());
        emailLog.setEmailType(emailType);
        emailLog.setSubject(subject);

        if (!enabled) {
            log.info("Email service is disabled. Skipping outbound email type: {} to recipient: {}", emailType, user.getEmail());
            emailLog.setStatus("SENT");
            emailLog.setSentAt(Instant.now());
            try {
                emailLogService.saveLog(emailLog);
            } catch (Exception dbEx) {
                log.error("Failed to write system email audit log to database: {}", dbEx.getMessage());
            }
            return;
        }

        Exception mailException = null;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromAddress);
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(body, true);

            mailSender.send(message);

            emailLog.setStatus("SENT");
            emailLog.setSentAt(Instant.now());
            log.info("Outbound system email sent successfully. Type: {}, Recipient: {}", emailType, user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send system email. Type: {}, Recipient: {}, Error: {}", emailType, user.getEmail(), e.getMessage());
            emailLog.setStatus("FAILED");
            emailLog.setErrorMessage(e.getMessage());
            mailException = e;
        }

        try {
            emailLogService.saveLog(emailLog);
        } catch (Exception dbEx) {
            log.error("Failed to write system email audit log to database: {}", dbEx.getMessage());
        }

        if (mailException != null) {
            throw new RuntimeException("Email delivery failed: " + mailException.getMessage(), mailException);
        }
    }
}
