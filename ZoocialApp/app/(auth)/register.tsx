import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { InputField } from '@/components/ui/InputField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { HeaderIcon } from '@/components/ui/HeaderIcon';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '@/services/auth';

const registerSchema = z.object({
  nombre_completo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  correo_e: z.string().email('Ingresa un correo válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const logoAnim = useRef(new Animated.Value(150)).current; 
  const formAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoAnim, {
        toValue: 0,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Create user via Laravel API
      const response = await authService.register({
         nombre_completo: data.nombre_completo,
         correo_e: data.correo_e,
         password: data.password
      });

      // Navigate to the verification step passing the new user id or just keeping it simple
      // Usually, registration gives a token or we log them in immediately.
      // For this flow, we will navigate to the next steps. We pass the user id to update it later.
      router.push({
         pathname: '/verification-date',
         params: { userId: response.id_usuario, email: data.correo_e, password: data.password }
      });
    } catch (error: any) {
      console.log('Registration error', error?.response?.data || error.message);
      // Format Laravel validation errors if present
      const apiErrors = error?.response?.data;
      let errMsg = 'Error al registrar la cuenta.';
      if (apiErrors?.correo_e) errMsg = apiErrors.correo_e[0];
      Alert.alert('Error', errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        <Animated.View style={[styles.backButton, { opacity: fadeAnim }]}>
           <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => router.back()}>
               <Ionicons name="arrow-back-circle-outline" size={28} color="#0c5cb3" />
               <Text style={styles.backText}>Crear cuenta</Text>
           </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: logoAnim }] }]}>
            <HeaderIcon size={60} />
            <Text style={styles.heading}>Únete a la comunidad</Text>
            <Text style={styles.subheading}>Completa los datos para empezar</Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: formAnim }] }}>
        <Controller
          control={control}
          name="nombre_completo"
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField
              placeholder="Nombre completo"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.nombre_completo?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="correo_e"
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.correo_e?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField
              placeholder="Contraseña"
              isPassword
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        <PrimaryButton 
          title="Registrarse" 
          onPress={handleSubmit(onSubmit)} 
          isLoading={isLoading} 
          style={{ marginTop: 20 }}
        />

        <View style={styles.footerContainer}>
             <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
             <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.linkText}>Inicia sesión</Text>
             </TouchableOpacity>
        </View>
        </Animated.View>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
     flexDirection: 'row',
     alignItems: 'center',
     marginBottom: 30,
  },
  backText: {
     fontSize: 18,
     fontWeight: 'bold',
     color: '#0c5cb3',
     marginLeft: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0c5cb3', // Deep blue
    marginTop: 10,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 15,
    color: '#666',
  },
  footerContainer: {
     flexDirection: 'row',
     justifyContent: 'center',
     marginTop: 40,
  },
  footerText: {
     color: '#666',
     fontSize: 15,
  },
  linkText: {
     color: '#f69622', // Orange text
     fontSize: 15,
     fontWeight: 'bold',
  }
});
