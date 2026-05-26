package com.studioops.quotation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studioops.config.SecurityConfig;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.quotation.dto.QuotationCreateRequest;
import com.studioops.quotation.dto.QuotationResponse;
import com.studioops.quotation.dto.QuotationUpdateRequest;
import com.studioops.quotation.dto.QuotationStatusUpdateRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(QuotationController.class)
@Import(SecurityConfig.class)
class QuotationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private QuotationService quotationService;

    @Test
    void createQuotation_Success() throws Exception {
        QuotationCreateRequest request = new QuotationCreateRequest();
        request.setTitle("Pre-wedding photography");
        request.setSubtotal(BigDecimal.valueOf(10000));
        request.setDiscountAmount(BigDecimal.valueOf(1000));
        request.setTaxAmount(BigDecimal.valueOf(1800));

        QuotationResponse response = new QuotationResponse();
        response.setId(UUID.randomUUID());
        response.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        response.setTitle("Pre-wedding photography");
        response.setQuotationNumber("QTN-20260526-ABCD");
        response.setStatus(QuotationStatus.DRAFT);
        response.setSubtotal(BigDecimal.valueOf(10000));
        response.setDiscountAmount(BigDecimal.valueOf(1000));
        response.setTaxAmount(BigDecimal.valueOf(1800));
        response.setTotalAmount(BigDecimal.valueOf(10800));
        response.setCurrency("INR");
        response.setCreatedAt(Instant.now());
        response.setUpdatedAt(Instant.now());

        when(quotationService.createQuotation(any(QuotationCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/quotations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(response.getId().toString()))
                .andExpect(jsonPath("$.title").value("Pre-wedding photography"))
                .andExpect(jsonPath("$.quotationNumber").value("QTN-20260526-ABCD"))
                .andExpect(jsonPath("$.totalAmount").value(10800))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    void createQuotation_ValidationErrors_BadRequest() throws Exception {
        // missing title
        QuotationCreateRequest request = new QuotationCreateRequest();
        request.setTitle("");

        mockMvc.perform(post("/api/quotations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.title").exists());

        verify(quotationService, never()).createQuotation(any());
    }

    @Test
    void getQuotationById_Success() throws Exception {
        UUID id = UUID.randomUUID();
        QuotationResponse response = new QuotationResponse();
        response.setId(id);
        response.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        response.setTitle("Birthday shoot");
        response.setQuotationNumber("QTN-birthday");
        response.setStatus(QuotationStatus.SENT);

        when(quotationService.getQuotationById(id)).thenReturn(response);

        mockMvc.perform(get("/api/quotations/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.title").value("Birthday shoot"));
    }

    @Test
    void getQuotationById_NotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(quotationService.getQuotationById(id)).thenThrow(new ResourceNotFoundException("Quotation not found"));

        mockMvc.perform(get("/api/quotations/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void listQuotations_Success() throws Exception {
        QuotationResponse response = new QuotationResponse();
        response.setId(UUID.randomUUID());
        response.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        response.setTitle("Anniversary photography");
        response.setStatus(QuotationStatus.ACCEPTED);

        when(quotationService.listQuotations(QuotationStatus.ACCEPTED)).thenReturn(Collections.singletonList(response));

        mockMvc.perform(get("/api/quotations")
                .param("status", "ACCEPTED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Anniversary photography"));
    }

    @Test
    void updateQuotation_Success() throws Exception {
        UUID id = UUID.randomUUID();
        QuotationUpdateRequest request = new QuotationUpdateRequest();
        request.setTitle("Engagement shoot");
        request.setSubtotal(BigDecimal.valueOf(15000));
        request.setDiscountAmount(BigDecimal.valueOf(2000));
        request.setTaxAmount(BigDecimal.valueOf(2700));

        QuotationResponse response = new QuotationResponse();
        response.setId(id);
        response.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        response.setTitle("Engagement shoot");
        response.setSubtotal(BigDecimal.valueOf(15000));
        response.setDiscountAmount(BigDecimal.valueOf(2000));
        response.setTaxAmount(BigDecimal.valueOf(2700));
        response.setTotalAmount(BigDecimal.valueOf(15700));
        response.setStatus(QuotationStatus.DRAFT);

        when(quotationService.updateQuotation(eq(id), any(QuotationUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/quotations/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Engagement shoot"))
                .andExpect(jsonPath("$.totalAmount").value(15700));
    }

    @Test
    void updateStatus_Success() throws Exception {
        UUID id = UUID.randomUUID();
        QuotationStatusUpdateRequest request = new QuotationStatusUpdateRequest(QuotationStatus.ACCEPTED);

        QuotationResponse response = new QuotationResponse();
        response.setId(id);
        response.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        response.setTitle("Portrait Shoot");
        response.setStatus(QuotationStatus.ACCEPTED);

        when(quotationService.updateStatus(eq(id), any(QuotationStatusUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/quotations/{id}/status", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));
    }

    @Test
    void deleteQuotation_Success() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(quotationService).deleteQuotation(id);

        mockMvc.perform(delete("/api/quotations/{id}", id))
                .andExpect(status().isNoContent());

        verify(quotationService, times(1)).deleteQuotation(id);
    }
}
