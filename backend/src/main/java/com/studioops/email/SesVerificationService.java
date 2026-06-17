package com.studioops.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sesv2.SesV2Client;
import software.amazon.awssdk.services.sesv2.model.GetEmailIdentityResponse;
import software.amazon.awssdk.services.sesv2.model.NotFoundException;

import java.time.Instant;
import java.util.UUID;

@Service
public class SesVerificationService {

    private static final Logger log = LoggerFactory.getLogger(SesVerificationService.class);

    private final boolean enabled;
    private final SystemEmailLogService emailLogService;
    private SesV2Client sesClient;

    public SesVerificationService(
            @Value("${studioops.ses-sandbox-verification.enabled:false}") boolean enabled,
            SystemEmailLogService emailLogService) {
        this.enabled = enabled;
        this.emailLogService = emailLogService;
        if (enabled) {
            try {
                this.sesClient = SesV2Client.builder()
                        .region(Region.of("eu-north-1"))
                        .build();
                log.info("AWS SESv2 Client initialized successfully for sandbox verification in region eu-north-1.");
            } catch (Exception e) {
                log.error("Failed to initialize AWS SESv2 Client: {}", e.getMessage());
                this.sesClient = null;
            }
        } else {
            this.sesClient = null;
        }
    }

    public boolean isEnabled() {
        return enabled;
    }

    public String getEmailVerificationStatus(String email) {
        if (!enabled || sesClient == null) {
            return "UNKNOWN";
        }
        try {
            GetEmailIdentityResponse response = sesClient.getEmailIdentity(r -> r.emailIdentity(email));
            return Boolean.TRUE.equals(response.verifiedForSendingStatus()) ? "VERIFIED" : "PENDING";
        } catch (NotFoundException e) {
            return "UNKNOWN";
        } catch (Exception e) {
            log.warn("Error checking SES verification status for {}: {}", email, e.getMessage());
            return "UNKNOWN";
        }
    }

    public void requestEmailVerification(String email, UUID studioId, UUID userId) {
        if (!enabled || sesClient == null) {
            log.info("SES sandbox verification is disabled. Skipping verification request for: {}", email);
            return;
        }

        SystemEmailLog auditLog = new SystemEmailLog();
        auditLog.setStudioId(studioId);
        auditLog.setUserId(userId);
        auditLog.setRecipient(email);
        auditLog.setSubject("AWS SES Sandbox Verification");

        try {
            // Check if identity already exists
            boolean exists = false;
            try {
                GetEmailIdentityResponse response = sesClient.getEmailIdentity(r -> r.emailIdentity(email));
                exists = true;
                if (Boolean.TRUE.equals(response.verifiedForSendingStatus())) {
                    log.info("Email identity {} is already verified in SES.", email);
                    auditLog.setEmailType("SES_SANDBOX_VERIFICATION_ALREADY_EXISTS");
                    auditLog.setStatus("SKIPPED");
                    auditLog.setSentAt(Instant.now());
                    emailLogService.saveLog(auditLog);
                    return;
                }
            } catch (NotFoundException e) {
                // Identity doesn't exist, which is expected
            }

            // Create/Request identity verification
            sesClient.createEmailIdentity(r -> r.emailIdentity(email));
            log.info("Successfully requested SES verification email for: {}", email);
            
            auditLog.setEmailType("SES_SANDBOX_VERIFICATION_REQUESTED");
            auditLog.setStatus("SENT");
            auditLog.setSentAt(Instant.now());
            emailLogService.saveLog(auditLog);
        } catch (Exception e) {
            log.error("Failed to request SES email verification for {}: {}", email, e.getMessage());
            auditLog.setEmailType("SES_SANDBOX_VERIFICATION_FAILED");
            auditLog.setStatus("FAILED");
            auditLog.setErrorMessage(e.getMessage());
            try {
                emailLogService.saveLog(auditLog);
            } catch (Exception dbEx) {
                log.error("Failed to write SES verification failure log to database: {}", dbEx.getMessage());
            }
        }
    }
}
