import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { HeaderIcon } from '@/components/ui/HeaderIcon';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SelectDropdown } from '@/components/ui/SelectDropdown';
import { authService } from '@/services/auth';
import { useAuth } from '@/hooks/useAuth';

export default function VerificationDateScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const params = useLocalSearchParams();
  const userId = Number(params.userId);

  const [date, setDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [role, setRole] = useState('normal'); // Default to 'normal' ('Usuario normal / Adoptante')
  const [isLoading, setIsLoading] = useState(false);

  const calculateAge = (dob: Date) => {
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  const age = date ? calculateAge(date) : null;
  const isUnderage = age !== null && age < 18;

  const handleConfirm = async () => {
    if (!date) {
      Alert.alert('Atención', 'Por favor selecciona tu fecha de nacimiento.');
      return;
    }
    
    // If underage, force normal role. Otherwise use selected role.
    const finalRole = isUnderage ? 'normal' : role;

    if (finalRole === 'veterinario') {
       // Navigate to the next step for document upload
       router.push({
         pathname: '/verification-final',
         params: { ...params, edad: age, rol: finalRole }
       });
       return;
    }

    setIsLoading(true);
    try {
      // Update the user profile with age and role
      await authService.updateUser(userId, { edad: age, rol: finalRole });
      
      // Attempt login to complete the flow and enter the app
      const loginResponse = await authService.login(String(params.email), String(params.password));
      await signIn(loginResponse.access_token, loginResponse.user);
      
      router.replace('/(tabs)');
    } catch (error: any) {
      console.log('Update Error', error?.response?.data || error.message);
      Alert.alert('Error', 'No se pudo actualizar el perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <HeaderIcon size={80} />
        <Text style={styles.heading}>Casi terminamos</Text>
        <Text style={styles.subheading}>
          Necesitamos validar algunos datos para brindarte la mejor experiencia.
        </Text>
      </View>

      <Text style={styles.label}>Fecha de nacimiento</Text>
      <TouchableOpacity 
        style={styles.datePickerButton} 
        onPress={() => setShowPicker(true)}
      >
        <Text style={date ? styles.dateText : styles.datePlaceholder}>
          {date ? date.toLocaleDateString() : 'Seleccionar fecha'}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()} // Can't be born in the future
          onChange={(event, selectedDate) => {
            setShowPicker(Platform.OS === 'ios');
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      {isUnderage && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>Eres menor de edad. Tendrás un perfil supervisado.</Text>
        </View>
      )}

      {!isUnderage && date && (
        <View style={{ marginTop: 20 }}>
          <SelectDropdown 
            label="Tipo de perfil"
            options={[
              { label: 'Usuario normal / Adoptante', value: 'normal' },
              { label: 'Rescatista', value: 'rescatista' },
              { label: 'Veterinario', value: 'veterinario' }
            ]}
            value={role}
            onSelect={setRole}
            placeholder="¿Cómo usarás Zoocial?"
          />
        </View>
      )}

      <PrimaryButton 
        title="Finalizar Registro"
        onPress={handleConfirm}
        isLoading={isLoading}
        disabled={!date}
        style={{ marginTop: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0c5cb3',
    marginTop: 10,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#c9ccd1',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 15,
    color: '#333',
  },
  datePlaceholder: {
    fontSize: 15,
    color: '#8e9094',
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ffeeba',
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  }
});
