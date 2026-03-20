import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, Modal, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const mockProducts = [
  { id: '1', name: 'Collar Ajustable Reflectivo', price: '$150.00', image: 'https://images.unsplash.com/photo-1602521921312-3f1cf17c6a51?w=400&auto=format&fit=crop' },
  { id: '2', name: 'Correa Retráctil', price: '$220.00', image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&auto=format&fit=crop' },
  { id: '3', name: 'Croquetas Premium 2kg', price: '$450.00', image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&auto=format&fit=crop' },
  { id: '4', name: 'Juguete Cuerda Bicolor', price: '$85.00', image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&auto=format&fit=crop' },
];

export default function StoreScreen() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [payMethod, setPayMethod] = useState<'card' | 'oxxo'>('card');
  const [cardInputs, setCardInputs] = useState({ number: '', exp: '', cvv: '', zip: '' });

  const processPayment = () => {
    setProcessingPayment(true);
    setTimeout(() => {
      setProcessingPayment(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setIsCheckoutOpen(false);
        setCardInputs({ number: '', exp: '', cvv: '', zip: '' });
      }, 2500);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tienda</Text>
        <TouchableOpacity style={styles.cartBtn}>
          <Ionicons name="cart-outline" size={24} color="#333" />
          <View style={styles.cartBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.promoBanner}>
          <View style={styles.promoTextContainer}>
            <Text style={styles.promoTitle}>Ofertas de Verano</Text>
            <Text style={styles.promoSub}>Hasta 40% OFF en accesorios</Text>
          </View>
          <View style={styles.promoImagePlaceholder}>
            <Ionicons name="gift-outline" size={40} color="#fff" />
          </View>
        </View>

        <View style={styles.categoriesHeader}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Ver todo</Text></TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
            <Text style={[styles.filterText, styles.filterTextActive]}>Alimentos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterText}>Juguetes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterText}>Accesorios</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 10, marginBottom: 16 }]}>Recomendados</Text>

        <View style={styles.productsGrid}>
          {mockProducts.map((p) => (
            <View key={p.id} style={styles.productCard}>
              <Image source={{ uri: p.image }} style={styles.productImage} resizeMode="cover" />
              <Text style={styles.productName} numberOfLines={2}>{p.name}</Text>
              <Text style={styles.productPrice}>{p.price}</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => { setSelectedProduct(p); setIsCheckoutOpen(true); }}>
                <Text style={styles.addBtnText}>Comprar</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Checkout Payment Modal */}
      <Modal visible={isCheckoutOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '92%', paddingHorizontal: 0 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Comprar {selectedProduct?.name}</Text>
              <TouchableOpacity onPress={() => setIsCheckoutOpen(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {paymentSuccess ? (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
                <Ionicons name="checkmark-circle" size={80} color="#2ba98b" />
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2ba98b', marginTop: 16 }}>¡Pago Exitoso!</Text>
                <Text style={{ fontSize: 15, color: '#555', marginTop: 8, textAlign: 'center' }}>Gracias por tu compra de {selectedProduct?.name}</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 16 }}>
                <Text style={{ fontSize: 13, color: '#64748b' }}>Completa tu pago seguro con tarjeta de crédito/débito.</Text>

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
                    IMPORTANTE: El cargo de esta compra aparecerá en tu estado de cuenta como "Zoocial Store - UNBO"
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.stripeBtn, processingPayment && { opacity: 0.7 }]}
                  onPress={processPayment}
                  disabled={processingPayment}
                >
                  {processingPayment ? <ActivityIndicator color="#fff" /> : <Text style={styles.stripeBtnText}>Pagar {selectedProduct?.price}</Text>}
                </TouchableOpacity>

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  cartBtn: {
    padding: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e63946',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  promoBanner: {
    backgroundColor: '#f69622',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  promoTextContainer: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  promoSub: {
    color: '#fff',
    fontSize: 14,
  },
  promoImagePlaceholder: {
    width: 70,
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    color: '#0c5cb3',
    fontSize: 14,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#0c5cb3',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    height: 40,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0c5cb3',
    marginBottom: 10,
  },
  addBtn: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 13,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '90%', overflow: 'hidden', paddingTop: 16
  },
  stripeLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 6 },
  stripeInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 6, paddingVertical: 12, paddingHorizontal: 14, fontSize: 14, color: '#0f172a' },
  payMethodCard: { flex: 1, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
  payMethodCardActive: { borderColor: '#0f172a', borderWidth: 2 },
  ccIcon: { width: 36, height: 24, borderRadius: 4, borderWidth: 1, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  ccText: { fontSize: 10, fontWeight: 'bold', color: '#1a1f36' },
  mcCircles: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#EB001B', opacity: 0.8 },
  stripeBtn: { backgroundColor: '#2ba98b', padding: 16, borderRadius: 6, alignItems: 'center', marginTop: 16, marginBottom: 8 },
  stripeBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
