package com.example.elitedriverbackend.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.example.elitedriverbackend.domain.dtos.CreateVehicleDTO;
import com.example.elitedriverbackend.domain.dtos.MaintenanceRecordDTO;
import com.example.elitedriverbackend.domain.dtos.UpdateVehicleDTO;
import com.example.elitedriverbackend.domain.dtos.VehicleResponseDTO;
import com.example.elitedriverbackend.domain.dtos.VehicleTypeDTO;
import com.example.elitedriverbackend.domain.entity.MaintenanceRecord;
import com.example.elitedriverbackend.domain.entity.Vehicle;
import com.example.elitedriverbackend.domain.entity.VehicleStatus;
import com.example.elitedriverbackend.domain.entity.VehicleType;
import com.example.elitedriverbackend.repositories.MaintenanceRecordRepository;
import com.example.elitedriverbackend.repositories.VehicleRepository;
import com.example.elitedriverbackend.repositories.VehicleTypeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
@Slf4j
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private VehicleTypeRepository vehicleTypeRepository;

    @Autowired
    private MaintenanceRecordRepository maintenanceRecordRepository;

    public void addVehicle(CreateVehicleDTO dto) {
        Vehicle v = new Vehicle();
        v.setName(dto.getName());
        v.setBrand(dto.getBrand());
        v.setModel(dto.getModel());
        v.setCapacity(dto.getCapacity());
        v.setPricePerDay(dto.getPricePerDay());
        v.setKilometers(dto.getKilometers());
        v.setFeatures(dto.getFeatures());
        v.setInsurancePhone(dto.getInsurancePhone());
        v.setKmForMaintenance(dto.getKmForMaintenance());
        v.setStatus(VehicleStatus.maintenanceCompleted);
        v.setMainImageUrl(requireImageUrl(dto.getMainImageUrl(), "mainImageUrl"));

        if (dto.getListImageUrls() != null) {
            v.setListImageUrls(normalizeImageUrls(dto.getListImageUrls()));
        }

        String typeName = dto.getVehicleType().getType();
        VehicleType type = vehicleTypeRepository.findByType(typeName)
                .orElseThrow(() -> new RuntimeException("Vehicle type '" + typeName + "' no encontrado"));
        v.setVehicleType(type);

        vehicleRepository.save(v);
    }

    public void updateVehicle(UpdateVehicleDTO dto, UUID id) {
        Vehicle v = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle con id " + id + " no encontrado"));
        Integer prevKm = v.getKilometers();

        // Update simple fields
        if (dto.getPricePerDay() != null)        v.setPricePerDay(dto.getPricePerDay());
        if (dto.getKilometers() != null)         v.setKilometers(dto.getKilometers());
        if (dto.getFeatures() != null)           v.setFeatures(dto.getFeatures());
        if (dto.getInsurancePhone() != null)     v.setInsurancePhone(dto.getInsurancePhone());
        if (dto.getKmForMaintenance() != null)   v.setKmForMaintenance(dto.getKmForMaintenance());
        if (dto.getMainImageUrl() != null)       v.setMainImageUrl(requireImageUrl(dto.getMainImageUrl(), "mainImageUrl"));
        if (dto.getListImageUrls() != null)      v.setListImageUrls(normalizeImageUrls(dto.getListImageUrls()));

        // Maintenance logic: record date+km when crossing a maintenance interval
        if (dto.getKilometers() != null && v.getKmForMaintenance() != null) {
            int currKm      = dto.getKilometers();
            int interval    = v.getKmForMaintenance();
            int prevCycles  = prevKm / interval;
            int currCycles  = currKm / interval;

            log.info("🔧 Checking maintenance for '{}' ({}→{} km), interval {}",
                    v.getName(), prevKm, currKm, interval);

            if (currCycles > prevCycles) {
                // Persist maintenance record
                MaintenanceRecord record = MaintenanceRecord.builder()
                        .vehicle(v)
                        .maintenanceDate(LocalDateTime.now())
                        .kmAtMaintenance(currKm)
                        .build();
                maintenanceRecordRepository.save(record);

                v.setStatus(VehicleStatus.maintenanceRequired);
                log.info("⚠️ '{}' now requires maintenance", v.getName());
            }
            else if (dto.getStatus() != null) {
                v.setStatus(dto.getStatus());
            }
        }
        else if (dto.getStatus() != null) {
            v.setStatus(dto.getStatus());
        }

        vehicleRepository.save(v);
    }

    public void deleteVehicle(UUID id) {
        Vehicle v = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle con id " + id + " no encontrado"));
        vehicleRepository.delete(v);
    }

    public List<VehicleResponseDTO> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public VehicleResponseDTO getVehicleById(UUID id) {
        Vehicle v = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle con id " + id + " no encontrado"));
        return toResponseDTO(v);
    }

    public List<VehicleResponseDTO> getVehicleByType(VehicleTypeDTO typeDto) {
        String typeName = typeDto.getType();
        VehicleType type = vehicleTypeRepository.findByType(typeName)
                .orElseThrow(() -> new RuntimeException("Vehicle type '" + typeName + "' no encontrado"));
        return vehicleRepository.findByVehicleType(type).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<VehicleResponseDTO> getVehicleByCapacity(String capacity) {
        int cap = Integer.parseInt(capacity);
        return vehicleRepository.findByCapacity(cap).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<VehicleResponseDTO> getAvailableVehicles(Date startDate, Date endDate) {
        return vehicleRepository.findAvailableBetween(
                        VehicleStatus.maintenanceCompleted,
                        startDate,
                        endDate
                ).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public Map<String, Object> importCarviVehicles(JsonNode payload) {
        JsonNode dataNode = payload.isArray() ? payload : payload.path("data");

        if (!dataNode.isArray()) {
            throw new IllegalArgumentException("El JSON debe ser un array de vehículos o un objeto con propiedad 'data'");
        }

        Set<String> existingSourceIds = vehicleRepository.findAll().stream()
                .map(this::getSourceId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        int received = dataNode.size();
        int created = 0;
        int skipped = 0;
        List<String> errors = new ArrayList<>();

        for (JsonNode sourceVehicle : dataNode) {
            String sourceId = text(sourceVehicle, "_id", null);

            try {
                if (sourceId != null && existingSourceIds.contains(sourceId)) {
                    skipped++;
                    continue;
                }

                if (sourceVehicle.path("isDeleted").asBoolean(false) || !sourceVehicle.path("isActive").asBoolean(true)) {
                    skipped++;
                    continue;
                }

                Vehicle vehicle = toVehicleFromCarvi(sourceVehicle);
                vehicleRepository.save(vehicle);

                if (sourceId != null) {
                    existingSourceIds.add(sourceId);
                }

                created++;
            } catch (Exception e) {
                skipped++;
                errors.add("Vehículo " + (sourceId != null ? sourceId : "sin id") + ": " + e.getMessage());
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("received", received);
        result.put("created", created);
        result.put("skipped", skipped);
        result.put("errors", errors);
        return result;
    }

    private Vehicle toVehicleFromCarvi(JsonNode sourceVehicle) {
        String sourceType = text(sourceVehicle, "type", "CAMIONETA").toUpperCase(Locale.ROOT);
        String mappedType = mapCarviVehicleType(sourceType);
        VehicleType vehicleType = vehicleTypeRepository.findByType(mappedType)
                .orElseGet(() -> vehicleTypeRepository.save(VehicleType.builder().type(mappedType).build()));

        String brand = truncate(text(sourceVehicle, "brand", "Marca"), 50);
        String model = truncate(text(sourceVehicle, "model", "Modelo"), 50);
        String year = text(sourceVehicle, "year", "");
        String name = truncate(String.join(" ", List.of(brand, model, year)).trim(), 100);
        String mainImageUrl = firstValidImageUrl(sourceVehicle);

        if (mainImageUrl == null) {
            throw new IllegalArgumentException("No tiene image/galery con URL http(s) válida");
        }

        List<String> imageUrls = imageUrls(sourceVehicle.path("galery")).stream()
                .filter(url -> !url.equals(mainImageUrl))
                .collect(Collectors.toList());

        return Vehicle.builder()
                .name(name)
                .brand(brand)
                .model(model)
                .capacity(clamp(sourceVehicle.path("seats").asInt(5), 1, 50))
                .pricePerDay(BigDecimal.valueOf(Math.max(sourceVehicle.path("price").asDouble(1), 1)))
                .kilometers(0)
                .features(carviFeatures(sourceVehicle, sourceType))
                .vehicleType(vehicleType)
                .kmForMaintenance(5000)
                .status(VehicleStatus.maintenanceCompleted)
                .mainImageUrl(requireImageUrl(mainImageUrl, "mainImageUrl"))
                .listImageUrls(normalizeImageUrls(imageUrls))
                .insurancePhone(text(sourceVehicle.path("partner"), "phone", "N/D"))
                .build();
    }

    private List<String> carviFeatures(JsonNode vehicle, String sourceType) {
        List<String> features = new ArrayList<>();
        addFeature(features, "Año", text(vehicle, "year", null));
        addFeature(features, "Placa", text(vehicle, "plate", null));
        addFeature(features, "Tipo original", sourceType);
        addFeature(features, "Transmisión", titleCase(text(vehicle, "transmission", null)));

        if (vehicle.path("ac").asBoolean(false)) {
            features.add("A/C");
        }

        if (vehicle.path("consumption").asDouble(0) > 0) {
            addFeature(features, "Consumo", vehicle.path("consumption").asText() + " km/l");
        }

        addFeature(features, "Estado origen", text(vehicle, "status", null));
        addFeature(features, "Partner", text(vehicle.path("partner"), "fullName", null));
        addFeature(features, "Fuente Carvi ID", text(vehicle, "_id", null));
        return features;
    }

    private void addFeature(List<String> features, String label, String value) {
        if (value != null && !value.isBlank()) {
            features.add(label + ": " + value.trim());
        }
    }

    private String mapCarviVehicleType(String type) {
        return switch (type) {
            case "PICKUP", "PICK-UP" -> "PickUp";
            case "SEDAN" -> "Sedan";
            case "MICROBUS", "MICROBÚS", "MINIBUS", "VAN" -> "Microbus";
            case "CAMIONETA", "SUV" -> "SUV";
            default -> "SUV";
        };
    }

    private String firstValidImageUrl(JsonNode vehicle) {
        List<String> candidates = new ArrayList<>();
        candidates.add(text(vehicle, "image", null));
        candidates.addAll(imageUrls(vehicle.path("galery")));

        return candidates.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(url -> !url.isBlank())
                .filter(this::isHttpUrl)
                .findFirst()
                .orElse(null);
    }

    private List<String> imageUrls(JsonNode galleryNode) {
        if (!galleryNode.isArray()) {
            return List.of();
        }

        List<String> urls = new ArrayList<>();
        Set<String> seen = new HashSet<>();

        for (JsonNode imageNode : galleryNode) {
            String url = imageNode.asText("").trim();
            if (isHttpUrl(url) && seen.add(url)) {
                urls.add(url);
            }
        }

        return urls;
    }

    private boolean isHttpUrl(String value) {
        try {
            URI uri = new URI(value);
            String scheme = uri.getScheme();
            return uri.getHost() != null && ("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme));
        } catch (Exception e) {
            return false;
        }
    }

    private String getSourceId(Vehicle vehicle) {
        if (vehicle.getFeatures() == null) {
            return null;
        }

        return vehicle.getFeatures().stream()
                .filter(Objects::nonNull)
                .filter(feature -> feature.startsWith("Fuente Carvi ID:"))
                .map(feature -> feature.replace("Fuente Carvi ID:", "").trim())
                .findFirst()
                .orElse(null);
    }

    private String text(JsonNode node, String fieldName, String fallback) {
        JsonNode value = node.path(fieldName);
        if (value.isMissingNode() || value.isNull()) {
            return fallback;
        }

        String text = value.asText("").trim();
        return text.isBlank() ? fallback : text;
    }

    private String titleCase(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String lower = value.toLowerCase(Locale.ROOT);
        return lower.substring(0, 1).toUpperCase(Locale.ROOT) + lower.substring(1);
    }

    private int clamp(int value, int min, int max) {
        return Math.min(Math.max(value, min), max);
    }

    private String truncate(String value, int maxLength) {
        if (value == null) {
            return "";
        }

        return value.length() > maxLength ? value.substring(0, maxLength).trim() : value;
    }

    // —————— Helper: map Vehicle + its MaintenanceRecords → DTO ——————
    private VehicleResponseDTO toResponseDTO(Vehicle v) {
        List<MaintenanceRecordDTO> hist = maintenanceRecordRepository
                .findByVehicleIdOrderByMaintenanceDateDesc(v.getId())
                .stream()
                .map(r -> MaintenanceRecordDTO.builder()
                        .id(r.getId())
                        .maintenanceDate(r.getMaintenanceDate())
                        .kmAtMaintenance(r.getKmAtMaintenance())
                        .createdAt(r.getCreatedAt())
                        .updatedAt(r.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());

        return VehicleResponseDTO.builder()
                .id(v.getId().toString())
                .name(v.getName())
                .brand(v.getBrand())
                .model(v.getModel())
                .capacity(v.getCapacity())
                .pricePerDay(v.getPricePerDay())
                .kilometers(v.getKilometers())
                .features(v.getFeatures())
                .vehicleType(VehicleResponseDTO.VehicleTypeInfo.builder()
                        .id(v.getVehicleType().getId().toString())
                        .type(v.getVehicleType().getType())
                        .build())
                .kmForMaintenance(v.getKmForMaintenance())
                .status(v.getStatus())
                .mainImageUrl(v.getMainImageUrl())
                .listImageUrls(v.getListImageUrls())
                .insurancePhone(v.getInsurancePhone())
                .maintenanceRecords(hist)
                .build();
    }

    private String requireImageUrl(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }

        return normalizeImageUrl(value, fieldName);
    }

    private List<String> normalizeImageUrls(List<String> urls) {
        return urls.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(url -> !url.isBlank())
                .map(url -> normalizeImageUrl(url, "listImageUrls"))
                .collect(Collectors.toList());
    }

    private String normalizeImageUrl(String value, String fieldName) {
        String trimmed = value.trim();

        try {
            URI uri = new URI(trimmed);
            String scheme = uri.getScheme();

            if (uri.getHost() == null || (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme))) {
                throw new IllegalArgumentException(fieldName + " must be a valid http(s) URL");
            }

            return trimmed;
        } catch (URISyntaxException e) {
            throw new IllegalArgumentException(fieldName + " must be a valid http(s) URL", e);
        }
    }
}
