package com.examplatform.model;

import com.examplatform.model.OptionValue;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Collections;
import java.util.List;

@Converter(autoApply = false)
public class OptionListJsonConverter implements AttributeConverter<List<OptionValue>, String> {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final TypeReference<List<OptionValue>> TYPE = new TypeReference<>() {};

    @Override
    public String convertToDatabaseColumn(List<OptionValue> attribute) {
        try {
            return (attribute == null || attribute.isEmpty())
                    ? "[]"
                    : MAPPER.writeValueAsString(attribute);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to serialize options", e);
        }
    }

    @Override
    public List<OptionValue> convertToEntityAttribute(String dbData) {
        try {
            if (dbData == null || dbData.isBlank()) return Collections.emptyList();
            return MAPPER.readValue(dbData, TYPE);
        } catch (Exception e) {
            return Collections.emptyList(); // tolerate bad rows
        }
    }
}
