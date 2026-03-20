import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { HeaderIcon } from '@/components/ui/HeaderIcon';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { authService } from '@/services/auth';
import { useAuth } from '@/hooks/useAuth';

export default function VerificationFinalScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const params = useLocalSearchParams();
  const userId = Number(params.userId);

  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [licenseDoc, setLicenseDoc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setIdPhoto(result.assets[0].uri);
  };

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (!result.canceled) setLicenseDoc(result.assets[0].uri);
  };

  const handleFinalize = async () => {
    if (!idPhoto || !licenseDoc) {
      Alert.alert('Atención', 'Por favor sube ambos documentos para continuar como Veterinario.');
      return;
    }
    
    setIsLoading(true);
    try {
      // 1. Update user profile to Veterinario and set age
      await authService.updateUser(userId, { 
          edad: Number(params.edad), 
          rol: String(params.rol) 
      });

      // 2. Here we would typically upload the files to Laravel (multipart/form-data)
      // Since it's outside the scope of the basic setup right now, we assume local success.
      console.log('Would upload:', { idPhoto, licenseDoc });

      // 3. Login
      const loginResponse = await authService.login(String(params.email), String(params.password));
      await signIn(loginResponse.access_token, loginResponse.user);
      
      router.replace('/(tabs)');
    } catch (error: any) {
      console.log('Update Error', error?.response?.data || error.message);
      Alert.alert('Error', 'No se pudo finalizar el registro.');
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

      <Text style={styles.label}>Documento de Identidad (INE/DNI)</Text>
      <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
         {idPhoto ? (
            <View style={styles.successRow}>
               <Ionicons name="checkmark-circle" size={24} color="#2a9d8f" />
               <Text style={styles.successText}>Foto cargada</Text>
            </View>
         ) : (
            <>
               <Ionicons name="add" size={24} color="#8e9094" />
               <Text style={styles.uploadText}>Foto de identificación oficial</Text>
            </>
         )}
      </TouchableOpacity>

      <Text style={[styles.label, { marginTop: 20 }]}>Cédula Profesional (PDF)</Text>
      <TouchableOpacity style={styles.uploadBox} onPress={pickDocument}>
         {licenseDoc ? (
            <View style={styles.successRow}>
               <Ionicons name="checkmark-circle" size={24} color="#0c5cb3" />
               <View>
                 <Text style={styles.docSuccessText}>Documento cargado</Text>
                 <Text style={styles.docSubText}>Toca para cambiar</Text>
               </View>
            </View>
         ) : (
            <>
               <Ionicons name="document-attach-outline" size={24} color="#8e9094" />
               <Text style={styles.uploadText}>Cargar archivo PDF</Text>
            </>
         )}
      </TouchableOpacity>

      <PrimaryButton 
        title="Finalizar Registro"
        onPress={handleFinalize}
        isLoading={isLoading}
        disabled={!idPhoto || !licenseDoc}
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
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 60,
  },
  uploadText: {
    fontSize: 15,
    color: '#8e9094',
    marginLeft: 10,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  successText: {
    fontSize: 15,
    color: '#2a9d8f',
    marginLeft: 10,
    fontWeight: '500',
  },
  docSuccessText: {
    fontSize: 15,
    color: '#0c5cb3',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  docSubText: {
    fontSize: 12,
    color: '#8e9094',
    marginLeft: 10,
  }
});
