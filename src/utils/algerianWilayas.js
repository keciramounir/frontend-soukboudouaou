/**
 * Complete list of all 69 Algerian Wilayas (Provinces)
 * Used for moving header mock data and other features
 */

export const ALGERIAN_WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa',
  'Biskra', 'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa',
  'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel',
  'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
  'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla',
  'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf',
  'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela', 'Souk Ahras', 'Tipaza',
  'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane',
  'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès', 'In Salah',
  'In Guezzam', 'Touggourt', 'Djanet', 'El M\'Ghair', 'El Meniaa',
];

/**
 * Generate moving header items for all wilayas with a specific price
 * @param {number} price - Price per kg
 * @param {string} product - Product name (default: "Poulet")
 * @param {string} unit - Unit (default: "kg")
 * @returns {array} Array of moving header items
 */
export function generateMovingHeaderItems(price = 250, product = "Poulet", unit = "kg") {
  return ALGERIAN_WILAYAS.map(wilaya => ({
    wilaya,
    price,
    product,
    unit,
  }));
}
