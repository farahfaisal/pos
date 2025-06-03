-- Update store settings with new values
UPDATE settings
SET value = jsonb_build_object(
  'name', 'النور كافيه',
  'email', '',
  'phone', '0597 672 268',
  'address', 'عين يبرود -الشارع الرئيسي بحانب مدينة الطيبات, Ramallah, Palestine',
  'logo', 'https://images.pexels.com/photos/1855214/pexels-photo-1855214.jpeg',
  'vat', '',
  'website', ''
)
WHERE key = 'store';