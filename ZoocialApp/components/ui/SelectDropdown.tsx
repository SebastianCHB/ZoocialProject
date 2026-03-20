import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Option = {
  label: string;
  value: string;
};

type SelectDropdownProps = {
  label?: string;
  options: Option[];
  value?: string;
  onSelect: (val: string) => void;
  placeholder?: string;
  error?: string;
};

export function SelectDropdown({ label, options, value, onSelect, placeholder = 'Selecciona...', error }: SelectDropdownProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (val: string) => {
    onSelect(val);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity 
         style={[styles.dropdownTrigger, error ? styles.dropdownError : null]} 
         onPress={() => setModalVisible(true)}
         activeOpacity={0.7}
      >
        <Text style={[styles.triggerText, !selectedOption && styles.placeholderText]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons name="caret-down-outline" size={16} color="#333" />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item, index }) => (
                <TouchableOpacity 
                  style={[
                    styles.optionItem, 
                    index === options.length - 1 && styles.lastOptionItem,
                    item.value === value && styles.selectedOptionItem
                  ]} 
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={[styles.optionText, item.value === value && styles.selectedOptionText]}>
                     {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#c9ccd1',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    height: 54,
  },
  dropdownError: {
    borderColor: '#e63946',
  },
  triggerText: {
    fontSize: 15,
    color: '#333',
  },
  placeholderText: {
    color: '#8e9094',
  },
  errorText: {
    color: '#e63946',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastOptionItem: {
    borderBottomWidth: 0,
  },
  selectedOptionItem: {
    backgroundColor: '#f5f8fc',
  },
  optionText: {
    fontSize: 15,
    color: '#333',
  },
  selectedOptionText: {
    fontWeight: 'bold',
    color: '#0c5cb3',
  }
});
