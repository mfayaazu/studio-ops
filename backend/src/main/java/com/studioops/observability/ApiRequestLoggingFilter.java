package com.studioops.observability;

import com.studioops.user.User;
import com.studioops.user.UserRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.UUID;

public class ApiRequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(ApiRequestLoggingFilter.class);

    private final ApiRequestLogRepository logRepository;
    private final UserRepository userRepository;

    public ApiRequestLoggingFilter(ApiRequestLogRepository logRepository, UserRepository userRepository) {
        this.logRepository = logRepository;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        
        // Populate Request ID in MDC and headers for all incoming requests
        String requestId = UUID.randomUUID().toString();
        MDC.put("requestId", requestId);
        response.setHeader("X-Request-ID", requestId);

        // Exclude paths not matching /api/** or matching health/performance endpoints to avoid loops/bloat
        boolean shouldLog = path.startsWith("/api") &&
                !path.startsWith("/api/health") &&
                !path.startsWith("/api/platform-admin/performance");

        if (!shouldLog) {
            filterChain.doFilter(request, response);
            MDC.clear();
            return;
        }

        long startTime = System.currentTimeMillis();
        Throwable exception = null;

        try {
            filterChain.doFilter(request, response);
        } catch (Throwable t) {
            exception = t;
            throw t;
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            
            // Extract remote IP
            String remoteIp = request.getHeader("X-Forwarded-For");
            if (remoteIp == null || remoteIp.trim().isEmpty()) {
                remoteIp = request.getRemoteAddr();
            } else {
                // If forwarded-for contains comma list, get first entry
                int commaIndex = remoteIp.indexOf(',');
                if (commaIndex != -1) {
                    remoteIp = remoteIp.substring(0, commaIndex).trim();
                }
            }

            // Extract authenticated user email (check standard context and fallback to session state)
            String userEmail = null;
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                userEmail = auth.getName();
            } else {
                HttpSession session = request.getSession(false);
                if (session != null) {
                    SecurityContext secContext = (SecurityContext) session.getAttribute("SPRING_SECURITY_CONTEXT");
                    if (secContext != null) {
                        Authentication secAuth = secContext.getAuthentication();
                        if (secAuth != null && secAuth.isAuthenticated() && !"anonymousUser".equals(secAuth.getPrincipal())) {
                            userEmail = secAuth.getName();
                        }
                    }
                }
            }

            // Lookup Studio ID based on user email
            UUID studioId = null;
            if (userEmail != null && !userEmail.trim().isEmpty()) {
                try {
                    User user = userRepository.findByEmail(userEmail).orElse(null);
                    if (user != null) {
                        studioId = user.getStudioId();
                    }
                } catch (Exception e) {
                    log.warn("Failed to lookup studio context for user: {}", userEmail, e);
                }
            }

            // Extract error message
            String errorMessage = null;
            if (exception != null) {
                errorMessage = exception.getMessage();
            } else {
                Object errAttr = request.getAttribute("observability.error_message");
                if (errAttr != null) {
                    errorMessage = errAttr.toString();
                } else {
                    Object servletErrAttr = request.getAttribute("jakarta.servlet.error.message");
                    if (servletErrAttr != null) {
                        errorMessage = servletErrAttr.toString();
                    }
                }
            }

            // Log details to application console logs
            int statusCode = response.getStatus();
            String method = request.getMethod();
            log.info("API request logging - RequestID: {}, Method: {}, Path: {}, Status: {}, Duration: {}ms, User: {}, Studio: {}",
                    requestId, method, path, statusCode, duration, userEmail, studioId);

            // Persist request statistics to the database
            try {
                // TODO: If traffic volume increases in the future, implement log sampling (e.g. log only 10% of GET requests)
                ApiRequestLog logEntity = new ApiRequestLog();
                logEntity.setCreatedAt(OffsetDateTime.now());
                logEntity.setRequestId(requestId);
                logEntity.setMethod(method);
                logEntity.setPath(path);
                logEntity.setStatusCode(statusCode);
                logEntity.setDurationMs(duration);
                logEntity.setUserEmail(userEmail);
                logEntity.setStudioId(studioId);
                logEntity.setRemoteIp(remoteIp);
                logEntity.setErrorMessage(errorMessage);
                logRepository.save(logEntity);
            } catch (Exception e) {
                log.error("Failed to write API request log to DB", e);
            }

            MDC.clear();
        }
    }
}
