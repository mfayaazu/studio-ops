package com.studioops.studio;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.studio.dto.StudioCreateRequest;
import com.studioops.studio.dto.StudioResponse;
import com.studioops.studio.dto.StudioUpdateRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class StudioServiceTest {

    @Mock
    private StudioRepository studioRepository;

    @InjectMocks
    private StudioService studioService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createStudio_Success() {
        StudioCreateRequest request = new StudioCreateRequest(
                "Nordic Light Studios",
                "nordic-light",
                "info@nordiclight.se",
                "+46700000000",
                "Sweden",
                "Europe/Stockholm"
        );

        Studio studio = new Studio();
        studio.setId(UUID.randomUUID());
        studio.setName(request.getName());
        studio.setSlug(request.getSlug());
        studio.setBusinessEmail(request.getBusinessEmail());
        studio.setPhone(request.getPhone());
        studio.setCountry(request.getCountry());
        studio.setTimezone(request.getTimezone());
        studio.setStatus(StudioStatus.ACTIVE);
        studio.setSubscriptionPlan(SubscriptionPlan.STARTER);
        studio.setSubscriptionStatus(SubscriptionStatus.TRIAL);
        studio.setCreatedAt(Instant.now());
        studio.setUpdatedAt(Instant.now());

        when(studioRepository.existsBySlug(request.getSlug())).thenReturn(false);
        when(studioRepository.save(any(Studio.class))).thenReturn(studio);

        StudioResponse response = studioService.createStudio(request);

        assertNotNull(response);
        assertEquals(studio.getId(), response.getId());
        assertEquals(request.getName(), response.getName());
        assertEquals(request.getSlug(), response.getSlug());
        assertEquals(request.getBusinessEmail(), response.getBusinessEmail());
        assertEquals(request.getPhone(), response.getPhone());
        assertEquals(request.getCountry(), response.getCountry());
        assertEquals(request.getTimezone(), response.getTimezone());
        assertEquals(StudioStatus.ACTIVE, response.getStatus());
        assertEquals(SubscriptionPlan.STARTER, response.getSubscriptionPlan());
        assertEquals(SubscriptionStatus.TRIAL, response.getSubscriptionStatus());

        verify(studioRepository, times(1)).save(any(Studio.class));
    }

    @Test
    void createStudio_DuplicateSlug_ThrowsException() {
        StudioCreateRequest request = new StudioCreateRequest(
                "Nordic Light Studios",
                "nordic-light",
                "info@nordiclight.se",
                null, null, null
        );

        when(studioRepository.existsBySlug(request.getSlug())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> studioService.createStudio(request));
        verify(studioRepository, never()).save(any(Studio.class));
    }

    @Test
    void createStudio_DefaultsApplied() {
        StudioCreateRequest request = new StudioCreateRequest(
                "Default Studio",
                "default-studio",
                null, null, null, null
        );

        Studio studio = new Studio();
        studio.setId(UUID.randomUUID());
        studio.setName(request.getName());
        studio.setSlug(request.getSlug());
        studio.setTimezone("Europe/Stockholm");
        studio.setStatus(StudioStatus.ACTIVE);
        studio.setSubscriptionPlan(SubscriptionPlan.STARTER);
        studio.setSubscriptionStatus(SubscriptionStatus.TRIAL);

        when(studioRepository.existsBySlug(request.getSlug())).thenReturn(false);
        when(studioRepository.save(any(Studio.class))).thenAnswer(invocation -> {
            Studio argument = invocation.getArgument(0);
            assertEquals("Europe/Stockholm", argument.getTimezone());
            assertEquals(StudioStatus.ACTIVE, argument.getStatus());
            assertEquals(SubscriptionPlan.STARTER, argument.getSubscriptionPlan());
            assertEquals(SubscriptionStatus.TRIAL, argument.getSubscriptionStatus());
            return studio;
        });

        StudioResponse response = studioService.createStudio(request);
        assertNotNull(response);
    }

    @Test
    void getStudioById_Success() {
        UUID id = UUID.randomUUID();
        Studio studio = new Studio();
        studio.setId(id);
        studio.setName("Test Studio");
        studio.setSlug("test-studio");

        when(studioRepository.findById(id)).thenReturn(Optional.of(studio));

        StudioResponse response = studioService.getStudioById(id);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals("Test Studio", response.getName());
    }

    @Test
    void getStudioById_NotFound_ThrowsException() {
        UUID id = UUID.randomUUID();
        when(studioRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> studioService.getStudioById(id));
    }

    @Test
    void updateStudio_Success() {
        UUID id = UUID.randomUUID();
        Studio studio = new Studio();
        studio.setId(id);
        studio.setName("Old Name");
        studio.setSlug("old-slug");

        StudioUpdateRequest request = new StudioUpdateRequest(
                "New Name",
                "new-slug",
                "new@example.com",
                "123456",
                "Norway",
                "Europe/Oslo",
                StudioStatus.SUSPENDED,
                SubscriptionPlan.PRO,
                SubscriptionStatus.ACTIVE
        );

        when(studioRepository.findById(id)).thenReturn(Optional.of(studio));
        when(studioRepository.existsBySlugAndIdNot(request.getSlug(), id)).thenReturn(false);
        when(studioRepository.save(any(Studio.class))).thenReturn(studio);

        StudioResponse response = studioService.updateStudio(id, request);

        assertNotNull(response);
        assertEquals("New Name", response.getName());
        assertEquals("new-slug", response.getSlug());
        assertEquals("new@example.com", response.getBusinessEmail());
        assertEquals("123456", response.getPhone());
        assertEquals("Norway", response.getCountry());
        assertEquals("Europe/Oslo", response.getTimezone());
        assertEquals(StudioStatus.SUSPENDED, response.getStatus());
        assertEquals(SubscriptionPlan.PRO, response.getSubscriptionPlan());
        assertEquals(SubscriptionStatus.ACTIVE, response.getSubscriptionStatus());
    }

    @Test
    void updateStudio_DuplicateSlug_ThrowsException() {
        UUID id = UUID.randomUUID();
        Studio studio = new Studio();
        studio.setId(id);

        StudioUpdateRequest request = new StudioUpdateRequest(
                "New Name",
                "existing-slug",
                null, null, null, "Europe/Stockholm",
                StudioStatus.ACTIVE, SubscriptionPlan.STARTER, SubscriptionStatus.TRIAL
        );

        when(studioRepository.findById(id)).thenReturn(Optional.of(studio));
        when(studioRepository.existsBySlugAndIdNot(request.getSlug(), id)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> studioService.updateStudio(id, request));
        verify(studioRepository, never()).save(any(Studio.class));
    }

    @Test
    void deleteStudio_Success() {
        UUID id = UUID.randomUUID();
        Studio studio = new Studio();
        studio.setId(id);

        when(studioRepository.findById(id)).thenReturn(Optional.of(studio));
        doNothing().when(studioRepository).delete(studio);

        assertDoesNotThrow(() -> studioService.deleteStudio(id));
        verify(studioRepository, times(1)).delete(studio);
    }

    @Test
    void listStudios_NoSearch_ReturnsAll() {
        Studio s1 = new Studio();
        s1.setName("Studio One");
        Studio s2 = new Studio();
        s2.setName("Studio Two");

        when(studioRepository.findAll()).thenReturn(List.of(s1, s2));

        List<StudioResponse> responses = studioService.listStudios(null);

        assertEquals(2, responses.size());
        verify(studioRepository, times(1)).findAll();
    }

    @Test
    void listStudios_WithSearch_ReturnsMatching() {
        Studio s1 = new Studio();
        s1.setName("Studio Matching");

        when(studioRepository.searchStudios("Matching")).thenReturn(List.of(s1));

        List<StudioResponse> responses = studioService.listStudios("Matching");

        assertEquals(1, responses.size());
        assertEquals("Studio Matching", responses.get(0).getName());
        verify(studioRepository, times(1)).searchStudios("Matching");
    }
}
