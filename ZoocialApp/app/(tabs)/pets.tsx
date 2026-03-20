import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, ActivityIndicator, Image, TextInput, Alert, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import api from '@/services/api';

type FichaSalud = {
  vacunado?: boolean;
  esterilizado?: boolean;
  descripcion_salud?: string;
  enfermedades?: string;
};

type Animalito = {
  id_animalito: number;
  nombre: string;
  edad_estimado?: string;
  genero: string;
  disponibilidad: string;
  fecha_ingreso?: string;
  raza?: { nombre: string; especie?: { nombre: string } };
  responsable?: { nombre: string; telefono?: string };
  fichaSalud?: FichaSalud;
  fotos?: { archivo: string }[];
};

import { getFullImageUrl } from '@/utils/imageUtils';

const CATEGORIES = [
  { title: 'Todos', icon: 'apps' as const },
  { title: 'Perros', icon: 'paw' as const },
  { title: 'Gatos', icon: 'fish-outline' as const },
  { title: 'Aves', icon: 'leaf-outline' as const },
  { title: 'Otros', icon: 'help-circle-outline' as const },
];

function getSpecies(pet: Animalito) {
  return pet.raza?.especie?.nombre || '';
}
function getColor(disponibilidad: string) {
  if (disponibilidad === 'disponible') return '#2a9d8f';
  if (disponibilidad === 'adoptado') return '#8e9094';
  return '#f69622';
}

export default function PetsScreen() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [pets, setPets] = useState<Animalito[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState<Animalito | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Add Pet state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addingPet, setAddingPet] = useState(false);
  const [newPet, setNewPet] = useState({ nombre: '', genero: 'Macho', edad_estimado: '', especie: 'Perro', raza: '' });
  const [newPetImage, setNewPetImage] = useState<string | undefined>();

  // Donation state
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState('5');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [payMethod, setPayMethod] = useState<'card' | 'oxxo'>('card');
  const [cardInputs, setCardInputs] = useState({ number: '', exp: '', cvv: '', zip: '' });

  const fetchPets = () => {
    setLoading(true);
    api.get('/animalito')
      .then(r => setPets(r.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useFocusEffect(useCallback(() => {
    fetchPets();
  }, []));

  const openPet = async (pet: Animalito) => {
    setLoadingDetail(true);
    setSelectedPet(pet);
    try {
      const r = await api.get(`/animalito/${pet.id_animalito}`);
      setSelectedPet(r.data);
    } catch { } finally { setLoadingDetail(false); }
  };

  const importImagePicker = require('expo-image-picker');
  const pickPetImage = async () => {
    const result = await importImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled && result.assets) {
      setNewPetImage(result.assets[0].uri);
    }
  };

  const submitNewPet = async () => {
    if (!newPet.nombre || !newPet.edad_estimado) {
      Alert.alert("Error", "Por favor completa el nombre y edad.");
      return;
    }
    setAddingPet(true);
    try {
      const formData = new FormData();
      formData.append('nombre', newPet.nombre);
      formData.append('genero', newPet.genero?.toLowerCase());
      formData.append('edad_estimado', newPet.edad_estimado);
      formData.append('disponibilidad', 'disponible');
      formData.append('fecha_ingreso', new Date().toISOString().split('T')[0]);
      formData.append('id_responsable', '1');
      formData.append('id_raza', '1');

      if (newPetImage) {
        const filename = newPetImage.split('/').pop() || 'pet.jpg';
        const ext = filename.split('.').pop() || 'jpg';
        if (Platform.OS === 'web') {
          const res = await fetch(newPetImage);
          const blob = await res.blob();
          formData.append('image', blob as any, filename);
        } else {
          formData.append('image', { uri: newPetImage, type: `image/${ext}`, name: filename } as any);
        }
      }

      await api.post('/animalito', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Alert.alert("¡Éxito!", "Mascota registrada para adopción exitosamente.");
      setIsAddModalOpen(false);
      setNewPet({ nombre: '', genero: 'Macho', edad_estimado: '', especie: 'Perro', raza: '' });
      setNewPetImage(undefined);
      fetchPets();
    } catch (e: any) {
      const errorMsg = e.response?.data ? JSON.stringify(e.response.data) : "No se pudo registrar.";
      Alert.alert("Error", errorMsg);
    } finally {
      setAddingPet(false);
    }
  };

  const processDonation = () => {
    setProcessingPayment(true);
    setTimeout(() => {
      setProcessingPayment(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setIsDonateOpen(false);
        setCardInputs({ number: '', exp: '', cvv: '', zip: '' }); // reset
      }, 2500);
    }, 2000);
  };

  const filtered = pets.filter(p => {
    if (activeCategory === 'Todos') return true;
    const sp = getSpecies(p).toLowerCase();
    if (activeCategory === 'Perros') return sp.includes('perro') || sp.includes('can');
    if (activeCategory === 'Gatos') return sp.includes('gato') || sp.includes('fel');
    if (activeCategory === 'Aves') return sp.includes('ave') || sp.includes('pájaro') || sp.includes('bird');
    if (activeCategory === 'Otros') return !sp.includes('perro') && !sp.includes('gato') && !sp.includes('ave');
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="paw" size={24} color="#0c5cb3" />
        <Text style={styles.headerTitle}>Adopta una mascota</Text>
      </View>

      {/* Category chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, minHeight: 60, maxHeight: 60 }} contentContainerStyle={styles.cats}>
        {CATEGORIES.map(c => (
          <TouchableOpacity
            key={c.title}
            style={[styles.catChip, activeCategory === c.title && styles.catChipActive]}
            onPress={() => setActiveCategory(c.title)}
          >
            <Ionicons name={c.icon} size={16} color={activeCategory === c.title ? '#fff' : '#0c5cb3'} />
            <Text style={[styles.catText, activeCategory === c.title && styles.catTextActive]}>{c.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loader}><ActivityIndicator size="large" color="#0c5cb3" /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={p => String(p.id_animalito)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[styles.listContent, { flexGrow: 1 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="paw-outline" size={56} color="#ddd" />
              <Text style={styles.emptyText}>No hay mascotas en esta categoría.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => openPet(item)} activeOpacity={0.85}>
              <View style={styles.cardImageBox}>
                {item.fotos?.length && item.fotos[0].archivo && getFullImageUrl(item.fotos[0].archivo) ? (
                  <Image source={{ uri: getFullImageUrl(item.fotos[0].archivo) }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                  <View style={styles.cardImagePlaceholder}>
                    <Ionicons name="paw" size={36} color="#0c5cb3" />
                  </View>
                )}
                <View style={[styles.statusBadge, { backgroundColor: getColor(item.disponibilidad) }]}>
                  <Text style={styles.statusText}>{item.disponibilidad}</Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <View style={{ height: 45 }}>
                  <Text style={styles.petName} numberOfLines={1}>{item.nombre}</Text>
                  <Text style={styles.petMeta} numberOfLines={1}>{item.raza?.nombre || 'Raza desconocida'}</Text>
                </View>
                <View style={styles.petTags}>
                  <View style={styles.tag}>
                    <Ionicons name={item.genero === 'Macho' ? 'male' : 'female'} size={11} color="#0c5cb3" />
                    <Text style={styles.tagText}>{item.genero}</Text>
                  </View>
                  {item.edad_estimado ? (
                    <View style={styles.tag}><Text style={styles.tagText}>🕐 {item.edad_estimado}</Text></View>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* FAB - Dar en Adopción */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsAddModalOpen(true)} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Pet Detail Modal */}
      <Modal visible={!!selectedPet} animationType="slide" transparent onRequestClose={() => setSelectedPet(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedPet(null)}>
              <Ionicons name="close-circle" size={30} color="#333" />
            </TouchableOpacity>

            {loadingDetail ? (
              <ActivityIndicator size="large" color="#0c5cb3" style={{ margin: 40 }} />
            ) : selectedPet && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero */}
                {selectedPet.fotos?.length && selectedPet.fotos[0].archivo && getFullImageUrl(selectedPet.fotos[0].archivo) ? (
                  <Image source={{ uri: getFullImageUrl(selectedPet.fotos[0].archivo) }} style={styles.heroImage} resizeMode="cover" />
                ) : (
                  <View style={styles.heroPlaceholder}>
                    <Ionicons name="paw" size={64} color="#0c5cb3" />
                  </View>
                )}

                <View style={styles.modalContent}>
                  <View style={styles.modalTitleRow}>
                    <Text style={styles.modalPetName}>{selectedPet.nombre}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getColor(selectedPet.disponibilidad) }]}>
                      <Text style={styles.statusText}>{selectedPet.disponibilidad}</Text>
                    </View>
                  </View>

                  {/* Basic info */}
                  <View style={styles.infoGrid}>
                    <InfoItem icon="paw-outline" label="Raza" value={selectedPet.raza?.nombre || 'N/D'} />
                    <InfoItem icon="leaf-outline" label="Especie" value={getSpecies(selectedPet) || 'N/D'} />
                    <InfoItem icon={selectedPet.genero === 'Macho' ? 'male' : 'female'} label="Género" value={selectedPet.genero} />
                    <InfoItem icon="time-outline" label="Edad" value={selectedPet.edad_estimado || 'N/D'} />
                    <InfoItem icon="calendar-outline" label="Ingreso" value={selectedPet.fecha_ingreso ? new Date(selectedPet.fecha_ingreso).toLocaleDateString('es-MX') : 'N/D'} />
                    {selectedPet.responsable && (
                      <InfoItem icon="person-outline" label="Responsable" value={selectedPet.responsable.nombre} />
                    )}
                  </View>

                  {/* Health card */}
                  {selectedPet.fichaSalud && (
                    <>
                      <Text style={styles.sectionTitle}>🏥 Ficha de Salud</Text>
                      <View style={styles.healthCard}>
                        <HealthBadge label="Vacunado" value={selectedPet.fichaSalud.vacunado} />
                        <HealthBadge label="Esterilizado" value={selectedPet.fichaSalud.esterilizado} />
                        {selectedPet.fichaSalud.descripcion_salud ? (
                          <View style={styles.healthNote}>
                            <Text style={styles.healthNoteLabel}>Estado de salud</Text>
                            <Text style={styles.healthNoteText}>{selectedPet.fichaSalud.descripcion_salud}</Text>
                          </View>
                        ) : null}
                        {selectedPet.fichaSalud.enfermedades ? (
                          <View style={styles.healthNote}>
                            <Text style={styles.healthNoteLabel}>Enfermedades conocidas</Text>
                            <Text style={styles.healthNoteText}>{selectedPet.fichaSalud.enfermedades}</Text>
                          </View>
                        ) : null}
                      </View>
                    </>
                  )}

                  {selectedPet.disponibilidad === 'disponible' && (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity style={[styles.adoptBtn, { flex: 1 }]}>
                        <Ionicons name="heart" size={18} color="#fff" />
                        <Text style={styles.adoptBtnText}>Adoptar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.adoptBtn, { flex: 1, backgroundColor: '#2a9d8f' }]} onPress={() => setIsDonateOpen(true)}>
                        <Ionicons name="gift" size={18} color="#fff" />
                        <Text style={styles.adoptBtnText}>Donar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Pet Modal */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '80%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Dar en Adopción</Text>
              <TouchableOpacity onPress={() => { setIsAddModalOpen(false); setNewPetImage(undefined); }}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
              <TouchableOpacity
                style={{ height: 140, backgroundColor: '#f1f5f9', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed', overflow: 'hidden' }}
                onPress={pickPetImage}
              >
                {newPetImage ? (
                  <Image source={{ uri: newPetImage }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={32} color="#64748b" />
                    <Text style={{ fontSize: 13, color: '#64748b', marginTop: 8, fontWeight: '500' }}>Añadir foto de la mascota</Text>
                  </>
                )}
              </TouchableOpacity>
              <View>
                <Text style={styles.inputLabel}>Nombre de la mascota</Text>
                <TextInput style={styles.input} placeholder="Ej. Firulais" value={newPet.nombre} onChangeText={t => setNewPet({ ...newPet, nombre: t })} />
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Especie</Text>
                  <TextInput style={styles.input} placeholder="Ej. Perro" value={newPet.especie} onChangeText={t => setNewPet({ ...newPet, especie: t })} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Raza</Text>
                  <TextInput style={styles.input} placeholder="Ej. Mestizo" value={newPet.raza} onChangeText={t => setNewPet({ ...newPet, raza: t })} />
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Género</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity style={[styles.genderBtn, newPet.genero === 'Macho' && styles.genderBtnActive]} onPress={() => setNewPet({ ...newPet, genero: 'Macho' })}>
                      <Text style={[styles.genderBtnText, newPet.genero === 'Macho' && styles.genderBtnTextActive]}>Macho</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.genderBtn, newPet.genero === 'Hembra' && styles.genderBtnActive]} onPress={() => setNewPet({ ...newPet, genero: 'Hembra' })}>
                      <Text style={[styles.genderBtnText, newPet.genero === 'Hembra' && styles.genderBtnTextActive]}>Hembra</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Edad Estimada</Text>
                  <TextInput style={styles.input} keyboardType="numeric" placeholder="Ej. 1.5" value={newPet.edad_estimado} onChangeText={t => setNewPet({ ...newPet, edad_estimado: t })} />
                </View>
              </View>
              <TouchableOpacity style={[styles.submitBtn, addingPet && { opacity: 0.7 }]} onPress={submitNewPet} disabled={addingPet}>
                {addingPet ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Publicar Adopción</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Donation Payment Modal */}
      <Modal visible={isDonateOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '92%', paddingHorizontal: 0 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Apadrina a {selectedPet?.nombre}</Text>
              <TouchableOpacity onPress={() => setIsDonateOpen(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {paymentSuccess ? (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
                <Ionicons name="checkmark-circle" size={80} color="#2ba98b" />
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2ba98b', marginTop: 16 }}>¡Pago Exitoso!</Text>
                <Text style={{ fontSize: 15, color: '#555', marginTop: 8, textAlign: 'center' }}>Gracias por tu donación de ${donationAmount} a {selectedPet?.nombre}</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 16 }}>
                <Text style={{ fontSize: 13, color: '#64748b' }}>Elige el monto a donar con tu tarjeta de crédito/débito.</Text>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {['5', '10', '20'].map(amt => (
                    <TouchableOpacity
                      key={amt}
                      onPress={() => setDonationAmount(amt)}
                      style={[styles.stripePill, donationAmount === amt ? styles.stripePillActive : null]}
                    >
                      <Text style={[styles.stripePillText, donationAmount === amt ? styles.stripePillTextActive : null]}>${amt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View>
                  <Text style={styles.stripeLabel}>Otro Monto</Text>
                  <TextInput
                    style={[styles.stripeInput, { backgroundColor: '#fff' }]}
                    keyboardType="numeric"
                    value={donationAmount}
                    onChangeText={setDonationAmount}
                    placeholder="5"
                  />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1e293b' }}>Métodos de pago</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#0f172a' }}>Pago seguro con stripe</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={[styles.payMethodCard, payMethod === 'card' && styles.payMethodCardActive]}
                    onPress={() => setPayMethod('card')}
                    activeOpacity={0.8}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <Text style={{ fontSize: 13, fontWeight: '500', color: '#1e293b' }}>Tarjeta de crédito / débito</Text>
                      {payMethod === 'card' && <Ionicons name="checkmark-circle" size={18} color="#0f172a" />}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={styles.ccIcon}><Text style={styles.ccText}>VISA</Text></View>
                      <View style={styles.ccIcon}><View style={styles.mcCircles} /></View>
                      <View style={[styles.ccIcon, { backgroundColor: '#1877F2' }]}><Text style={[styles.ccText, { color: '#fff', fontSize: 9 }]}>AMEX</Text></View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.payMethodCard, payMethod === 'oxxo' && styles.payMethodCardActive]}
                    onPress={() => setPayMethod('oxxo')}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '500', color: '#1e293b', marginBottom: 12 }}>Efectivo en OXXO</Text>
                    <View style={[styles.ccIcon, { width: 44, borderColor: '#e2e8f0' }]}>
                      <Text style={{ color: '#E52329', fontWeight: 'bold', fontSize: 11 }}>OXXO</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {payMethod === 'card' && (
                  <View style={{ gap: 12 }}>
                    <View>
                      <Text style={styles.stripeLabel}>Número en la tarjeta</Text>
                      <TextInput
                        style={[styles.stripeInput, { borderColor: '#000', borderWidth: 1.5 }]}
                        keyboardType="numeric"
                        placeholder="0000 0000 0000 0000"
                        value={cardInputs.number}
                        onChangeText={t => setCardInputs({ ...cardInputs, number: t })}
                      />
                    </View>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.stripeLabel}>Fecha de expiración</Text>
                        <TextInput
                          style={styles.stripeInput} placeholder="MM/AA"
                          value={cardInputs.exp} onChangeText={t => setCardInputs({ ...cardInputs, exp: t })}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.stripeLabel}>CVV</Text>
                        <TextInput
                          style={styles.stripeInput} placeholder="123" secureTextEntry keyboardType="numeric"
                          value={cardInputs.cvv} onChangeText={t => setCardInputs({ ...cardInputs, cvv: t })}
                        />
                      </View>
                    </View>
                    <View>
                      <Text style={styles.stripeLabel}>Código postal</Text>
                      <TextInput
                        style={styles.stripeInput} placeholder="00000" keyboardType="numeric"
                        value={cardInputs.zip} onChangeText={t => setCardInputs({ ...cardInputs, zip: t })}
                      />
                    </View>
                  </View>
                )}

                <View style={{ backgroundColor: '#e6ffec', borderRadius: 8, padding: 14, marginTop: 4 }}>
                  <Text style={{ fontSize: 12, color: '#0f172a', fontWeight: '500', textAlign: 'center' }}>
                    IMPORTANTE: El cargo de esta compra aparecerá en tu estado de cuenta como "Boletos - UNBO"
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.stripeBtn, processingPayment && { opacity: 0.7 }]}
                  onPress={processDonation}
                  disabled={processingPayment}
                >
                  {processingPayment ? <ActivityIndicator color="#fff" /> : <Text style={styles.stripeBtnText}>Pagar ${donationAmount || '0'}</Text>}
                </TouchableOpacity>

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Ionicons name={icon} size={16} color="#0c5cb3" />
      <View style={{ marginLeft: 8 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function HealthBadge({ label, value }: { label: string; value?: boolean }) {
  const yes = value === true;
  return (
    <View style={styles.healthBadge}>
      <Ionicons name={yes ? 'checkmark-circle' : 'close-circle'} size={18} color={yes ? '#2a9d8f' : '#e63946'} />
      <Text style={styles.healthBadgeText}>{label}: <Text style={{ color: yes ? '#2a9d8f' : '#e63946', fontWeight: '700' }}>{yes ? 'Sí' : 'No'}</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fc' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingTop: 58, paddingBottom: 14, backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  cats: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#eef4fc', borderWidth: 1, borderColor: '#d0e3f8',
  },
  catChipActive: { backgroundColor: '#0c5cb3', borderColor: '#0c5cb3' },
  catText: { fontSize: 13, fontWeight: '600', color: '#0c5cb3' },
  catTextActive: { color: '#fff' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 12, paddingBottom: 130 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  card: {
    width: '48%', backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  cardImageBox: { width: '100%', height: 130, position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  cardImagePlaceholder: { width: '100%', height: '100%', backgroundColor: '#f0f4f8', justifyContent: 'center', alignItems: 'center' },
  statusBadge: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  cardBody: { padding: 10 },
  petName: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 2 },
  petMeta: { fontSize: 12, color: '#8e9094', marginBottom: 6 },
  petTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#eef4fc', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 10, color: '#0c5cb3', fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#aaa', marginTop: 10, fontSize: 14 },
  // Detail Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '90%', overflow: 'hidden',
  },
  modalClose: { position: 'absolute', top: 14, right: 14, zIndex: 10 },
  heroImage: { width: '100%', height: 220 },
  heroPlaceholder: { width: '100%', height: 180, backgroundColor: '#f0f4f8', justifyContent: 'center', alignItems: 'center' },
  modalContent: { padding: 20, paddingBottom: 40 },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalPetName: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  infoItem: { flexDirection: 'row', alignItems: 'center', width: '45%' },
  infoLabel: { fontSize: 11, color: '#8e9094', fontWeight: '600' },
  infoValue: { fontSize: 13, color: '#333', fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  healthCard: {
    backgroundColor: '#f8fffe', borderRadius: 16, padding: 14, gap: 8,
    borderWidth: 1, borderColor: '#d0f0e8', marginBottom: 20,
  },
  healthBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  healthBadgeText: { fontSize: 14, color: '#555' },
  healthNote: { borderTopWidth: 1, borderTopColor: '#e8f5f0', paddingTop: 8, marginTop: 4 },
  healthNoteLabel: { fontSize: 12, color: '#8e9094', fontWeight: '600', marginBottom: 4 },
  healthNoteText: { fontSize: 14, color: '#333', lineHeight: 20 },
  adoptBtn: {
    backgroundColor: '#f69622', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 18,
  },
  adoptBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  fab: {
    position: 'absolute', bottom: 130, right: 20, width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#0c5cb3', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4,
  },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, fontSize: 15, color: '#334155' },
  genderBtn: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, alignItems: 'center' },
  genderBtnActive: { backgroundColor: '#eef4fc', borderColor: '#0c5cb3' },
  genderBtnText: { color: '#64748b', fontWeight: '600' },
  genderBtnTextActive: { color: '#0c5cb3' },
  submitBtn: { backgroundColor: '#0c5cb3', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Stripe UI Styles
  stripePill: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#fff', alignItems: 'center' },
  stripePillActive: { backgroundColor: '#f0f9ff', borderColor: '#3b82f6' },
  stripePillText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  stripePillTextActive: { color: '#3b82f6' },
  stripeLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 6 },
  stripeInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 6, paddingVertical: 12, paddingHorizontal: 14, fontSize: 14, color: '#0f172a' },
  payMethodCard: { flex: 1, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
  payMethodCardActive: { borderColor: '#0f172a', borderWidth: 2 },
  ccIcon: { width: 36, height: 24, borderRadius: 4, borderWidth: 1, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  ccText: { fontSize: 10, fontWeight: 'bold', color: '#1a1f36' },
  mcCircles: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#EB001B', opacity: 0.8 },
  stripeBtn: { backgroundColor: '#2ba98b', padding: 16, borderRadius: 6, alignItems: 'center', marginTop: 16, marginBottom: 8 },
  stripeBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
