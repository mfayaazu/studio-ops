package com.studioops.email;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SystemEmailLogService {

    private final SystemEmailLogRepository logRepository;

    public SystemEmailLogService(SystemEmailLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public SystemEmailLog saveLog(SystemEmailLog log) {
        return logRepository.save(log);
    }
}
