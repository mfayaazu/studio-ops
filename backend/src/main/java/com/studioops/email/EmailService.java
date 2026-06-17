package com.studioops.email;

import com.studioops.user.User;
import com.studioops.studio.Studio;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.time.ZoneId;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final SystemEmailLogService emailLogService;

    @Value("${studioops.email.enabled:false}")
    private boolean enabled;

    @Value("${studioops.email.from:no-reply@studioops.photo}")
    private String fromAddress;

    @Value("${studioops.email.from-name:StudioOps Beta}")
    private String fromName;

    @Value("${studioops.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${studioops.platform-admin.notifications.enabled:false}")
    private boolean platformAdminNotificationsEnabled;

    @Value("${studioops.platform-admin.emails:a.fayaaz@gmail.com}")
    private java.util.List<String> platformAdminEmails;

    @Value("${studioops.platform-admin.email:}")
    private String platformAdminEmail;

    public EmailService(JavaMailSender mailSender, SystemEmailLogService emailLogService) {
        this.mailSender = mailSender;
        this.emailLogService = emailLogService;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void sendEmployeeInviteEmail(User user, String studioName, String inviteToken, String replyToEmail) {
        String subject = "You have been invited to " + studioName + " on StudioOps";
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

        sendEmail(user, "EMPLOYEE_INVITE", subject, htmlContent, replyToEmail);
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

        sendEmail(user, "PASSWORD_RESET", subject, htmlContent, fromAddress);
    }

    private void sendEmail(User user, String emailType, String subject, String body, String replyTo) {
        SystemEmailLog emailLog = new SystemEmailLog();
        emailLog.setStudioId(user.getStudioId());
        emailLog.setUserId(user.getId());
        emailLog.setRecipient(user.getEmail());
        emailLog.setEmailType(emailType);
        emailLog.setSubject(subject);

        if (!enabled) {
            log.info("Email service is disabled. Skipping outbound email type: {} to recipient: {}", emailType, user.getEmail());
            emailLog.setStatus("SKIPPED");
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
            
            helper.setFrom(fromAddress, fromName);
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(body, true);
            if (replyTo != null && !replyTo.isBlank()) {
                helper.setReplyTo(replyTo);
            } else {
                helper.setReplyTo(fromAddress);
            }

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

    public void sendPlatformBetaSignupNotification(Studio studio, User owner) {
        if (!platformAdminNotificationsEnabled) {
            log.info("Platform admin notifications are disabled. Skipping beta signup notification for studio: {}", studio.getName());
            return;
        }

        java.util.List<String> recipientsList = new java.util.ArrayList<>();
        if (platformAdminEmail != null && !platformAdminEmail.isBlank()) {
            recipientsList.add(platformAdminEmail.trim());
        } else if (platformAdminEmails != null) {
            for (String email : platformAdminEmails) {
                if (email != null && !email.isBlank()) {
                    recipientsList.add(email.trim());
                }
            }
        }

        if (recipientsList.isEmpty()) {
            log.warn("No platform admin notification emails found in config. Skipping beta signup notification for studio: {}", studio.getName());
            return;
        }

        String[] recipients = recipientsList.toArray(new String[0]);

        String subject = "New StudioOps beta access request: " + studio.getName();
        
        DateTimeFormatter formatter = DateTimeFormatter
                .ofPattern("yyyy-MM-dd HH:mm:ss")
                .withZone(ZoneId.of("UTC"));
        String submittedTimestamp = formatter.format(Instant.now()) + " UTC";

        String htmlContent = "<div style=\"font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0b0f19; color: #f8fafc; border-radius: 8px;\">" +
                "<h2 style=\"color: #a78bfa;\">Beta Workspace Request</h2>" +
                "<p>A new beta signup request has been submitted and is pending approval.</p>" +
                "<hr style=\"border: none; border-top: 1px solid #1e293b; margin: 20px 0;\">" +
                "<table style=\"width: 100%; border-collapse: collapse;\">" +
                "<tr><td style=\"padding: 8px 0; color: #94a3b8; width: 180px;\"><strong>Request Type:</strong></td><td style=\"padding: 8px 0;\">Beta Workspace Request</td></tr>" +
                "<tr><td style=\"padding: 8px 0; color: #94a3b8;\"><strong>Studio Name:</strong></td><td style=\"padding: 8px 0;\">" + studio.getName() + "</td></tr>" +
                "<tr><td style=\"padding: 8px 0; color: #94a3b8;\"><strong>Studio ID:</strong></td><td style=\"padding: 8px 0; font-family: monospace; font-size: 13px;\">" + studio.getId() + "</td></tr>" +
                "<tr><td style=\"padding: 8px 0; color: #94a3b8;\"><strong>Studio Status:</strong></td><td style=\"padding: 8px 0; color: #fbbf24;\"><strong>" + studio.getStatus().name() + "</strong></td></tr>" +
                "<tr><td style=\"padding: 8px 0; color: #94a3b8;\"><strong>Owner Name:</strong></td><td style=\"padding: 8px 0;\">" + owner.getDisplayName() + "</td></tr>" +
                "<tr><td style=\"padding: 8px 0; color: #94a3b8;\"><strong>Owner Email:</strong></td><td style=\"padding: 8px 0;\">" + owner.getEmail() + "</td></tr>" +
                "<tr><td style=\"padding: 8px 0; color: #94a3b8;\"><strong>Phone:</strong></td><td style=\"padding: 8px 0;\">" + (studio.getPhone() != null ? studio.getPhone() : "N/A") + "</td></tr>" +
                "<tr><td style=\"padding: 8px 0; color: #94a3b8;\"><strong>Country:</strong></td><td style=\"padding: 8px 0;\">" + (studio.getCountry() != null ? studio.getCountry() : "N/A") + "</td></tr>" +
                "<tr><td style=\"padding: 8px 0; color: #94a3b8;\"><strong>Submitted:</strong></td><td style=\"padding: 8px 0;\">" + submittedTimestamp + "</td></tr>" +
                "<tr><td style=\"padding: 8px 0; color: #94a3b8;\"><strong>Subscription Status:</strong></td><td style=\"padding: 8px 0;\">" + (studio.getSubscriptionStatus() != null ? studio.getSubscriptionStatus().name() : "N/A") + "</td></tr>" +
                "<tr><td style=\"padding: 8px 0; color: #94a3b8;\"><strong>Subscription Plan:</strong></td><td style=\"padding: 8px 0;\">" + (studio.getSubscriptionPlan() != null ? studio.getSubscriptionPlan().name() : "N/A") + "</td></tr>" +
                "</table>" +
                "<hr style=\"border: none; border-top: 1px solid #1e293b; margin: 20px 0;\">" +
                "<p style=\"font-weight: bold; color: #a78bfa;\">Manual Approval Instruction:</p>" +
                "<p style=\"background-color: #1e1b4b; border-left: 4px solid #6366f1; padding: 12px; border-radius: 4px; color: #e0e7ff; font-size: 14px;\">" +
                "Approve this studio using the platform/admin approval API or direct database/admin tooling." +
                "</p>" +
                "</div>";

        for (String recipient : recipients) {
            SystemEmailLog emailLog = new SystemEmailLog();
            emailLog.setStudioId(studio.getId());
            emailLog.setUserId(null);
            emailLog.setRecipient(recipient);
            emailLog.setEmailType("PLATFORM_BETA_SIGNUP_NOTIFICATION");
            emailLog.setSubject(subject);

            if (!enabled) {
                log.info("Email service is disabled. Skipping outbound platform admin email to recipient: {}", recipient);
                emailLog.setStatus("SKIPPED");
                try {
                    emailLogService.saveLog(emailLog);
                } catch (Exception dbEx) {
                    log.error("Failed to write platform system email audit log to database: {}", dbEx.getMessage());
                }
                continue;
            }

            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                
                helper.setFrom(fromAddress, fromName);
                helper.setTo(recipient);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                helper.setReplyTo(fromAddress);

                mailSender.send(message);

                emailLog.setStatus("SENT");
                emailLog.setSentAt(Instant.now());
                log.info("Outbound platform system email sent successfully. Recipient: {}", recipient);
            } catch (Exception e) {
                log.warn("Failed to send platform admin beta signup notification. Recipient: {}, Error: {}", recipient, e.getMessage());
                emailLog.setStatus("FAILED");
                emailLog.setErrorMessage(e.getMessage());
            }

            try {
                emailLogService.saveLog(emailLog);
            } catch (Exception dbEx) {
                log.error("Failed to write platform system email audit log to database: {}", dbEx.getMessage());
            }
        }
    }

    public void sendStudioApprovedEmail(User owner, String studioName) {
        String subject = "Your StudioOps beta access has been approved";
        String workspaceUrl = frontendUrl + "/#/login";

        String htmlContent = "<div style=\"font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0b0f19; color: #f8fafc; border-radius: 8px;\">" +
                "<h2 style=\"color: #a78bfa;\">Workspace Approved!</h2>" +
                "<p>Hello " + (owner.getDisplayName() != null ? owner.getDisplayName() : "") + ",</p>" +
                "<p>Great news! Your StudioOps beta workspace <strong>" + studioName + "</strong> has been approved by the platform admin.</p>" +
                "<p>You can now log in and start managing your photography operations:</p>" +
                "<div style=\"margin: 30px 0; text-align: center;\">" +
                "<a href=\"" + workspaceUrl + "\" style=\"background-color: #7c3aed; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;\">Go to Workspace</a>" +
                "</div>" +
                "<p style=\"font-size: 12px; color: #94a3b8;\">If the button above does not work, copy and paste this link in your browser:</p>" +
                "<p style=\"font-size: 12px; color: #a78bfa; word-break: break-all;\">" + workspaceUrl + "</p>" +
                "<hr style=\"border: none; border-top: 1px solid #1e293b; margin: 20px 0;\">" +
                "<p style=\"font-size: 11px; color: #64748b;\">Thank you for joining the StudioOps beta program!</p>" +
                "</div>";

        sendEmail(owner, "STUDIO_APPROVED", subject, htmlContent, fromAddress);
    }

    public void sendStudioRejectedEmail(User owner, String studioName) {
        String subject = "Your StudioOps beta request update";
        String loginUrl = frontendUrl + "/#/login";

        String htmlContent = "<div style=\"font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0b0f19; color: #f8fafc; border-radius: 8px;\">" +
                "<h2 style=\"color: #f87171;\">Beta Request Update</h2>" +
                "<p>Hello " + (owner.getDisplayName() != null ? owner.getDisplayName() : "") + ",</p>" +
                "<p>Thank you for your interest in StudioOps. We have reviewed your request for the beta workspace <strong>" + studioName + "</strong>.</p>" +
                "<p>Unfortunately, we are unable to approve your beta access request at this time.</p>" +
                "<p>If you have any questions, you can contact us at " + fromAddress + " or visit the platform at:</p>" +
                "<div style=\"margin: 30px 0; text-align: center;\">" +
                "<a href=\"" + loginUrl + "\" style=\"background-color: #374151; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;\">Go to StudioOps</a>" +
                "</div>" +
                "<p style=\"font-size: 12px; color: #94a3b8;\">If the button above does not work, copy and paste this link in your browser:</p>" +
                "<p style=\"font-size: 12px; color: #a78bfa; word-break: break-all;\">" + loginUrl + "</p>" +
                "<hr style=\"border: none; border-top: 1px solid #1e293b; margin: 20px 0;\">" +
                "<p style=\"font-size: 11px; color: #64748b;\">Thank you for your time.</p>" +
                "</div>";

        sendEmail(owner, "STUDIO_REJECTED", subject, htmlContent, fromAddress);
    }

    public void sendStudioOwnerBetaSignupConfirmation(Studio studio, User owner) {
        String subject = "We received your StudioOps beta access request";

        String htmlContent = "<div style=\"font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0b0f19; color: #f8fafc; border-radius: 8px;\">" +
                "<h2 style=\"color: #a78bfa;\">Beta Access Request Received</h2>" +
                "<p>Hi " + (owner.getDisplayName() != null ? owner.getDisplayName() : "") + ",</p>" +
                "<p>Thank you for requesting access to StudioOps Beta for <strong>" + studio.getName() + "</strong>.</p>" +
                "<p>We have received your request and our team will review it shortly. Once approved, you will receive another email with instructions to access your StudioOps workspace.</p>" +
                "<hr style=\"border: none; border-top: 1px solid #1e293b; margin: 20px 0;\">" +
                "<p style=\"font-size: 12px; color: #94a3b8;\">Best regards,<br>StudioOps Beta Team</p>" +
                "</div>";

        try {
            sendEmail(owner, "BETA_SIGNUP_CONFIRMATION", subject, htmlContent, fromAddress);
        } catch (Exception e) {
            log.warn("Failed to send studio owner beta signup confirmation to recipient: {}, Error: {}", owner.getEmail(), e.getMessage());
        }
    }
}
