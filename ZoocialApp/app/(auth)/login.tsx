import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HeaderIcon } from '@/components/ui/HeaderIcon';
import { InputField } from '@/components/ui/InputField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SocialButton } from '@/components/ui/SocialButton';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth';
import { Link } from 'expo-router';

const loginSchema = z.object({
  correo_e: z.string().email('Ingresa un correo válido').min(1, 'El correo es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
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

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data.correo_e, data.password);
      await signIn(response.access_token, response.user);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.log('Login error', error?.response?.data || error.message);
      // In a real app we'd parse the Laravel validation exceptions specifically
      Alert.alert('Error', error?.response?.data?.message || 'Error al iniciar sesión. Revisa tus credenciales.');
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
        
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: logoAnim }] }]}>
          <HeaderIcon size={80} />
          <Text style={styles.title}>Zoocial</Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: formAnim }] }}>
          <View style={styles.topCard}>
              <Text style={styles.heading}>Bienvenido</Text>
              <Text style={styles.subheading}>Inicia sesión para continuar</Text>
          </View>

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

        <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>

        <PrimaryButton 
          title="Iniciar Sesión" 
          onPress={handleSubmit(onSubmit)} 
          isLoading={isLoading} 
        />

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>O conéctate con</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialContainer}>
          <SocialButton provider="google" onPress={() => console.log('Google login')} />
          <SocialButton provider="facebook" onPress={() => console.log('Facebook login')} />
        </View>

        <View style={styles.footerContainer}>
             <Text style={styles.footerText}>¿No tienes cuenta? </Text>
             <Link href="/register" style={styles.linkText}>Regístrate</Link>
        </View>
        </Animated.View>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f69622', // Orange top part
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 180, // Space for the orange header background
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
  },
  header: {
    position: 'absolute',
    top: -140, // Pull it up into the orange zone
    alignSelf: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 10,
  },
  topCard: {
     alignItems: 'center',
     marginBottom: 30,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0c5cb3', // Deep blue
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: '#666',
  },
  forgotPassword: {
    color: '#0c5cb3',
    fontWeight: '600',
    textAlign: 'right',
    marginTop: -8,
    marginBottom: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e1e1',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#8e9094',
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
