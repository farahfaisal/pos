-- Update store settings with new values
UPDATE settings
SET value = jsonb_build_object(
  'name', 'شركة النصير للبورسلان',
  'email', '',
  'phone', '0597 672 268',
  'address', 'عين يبرود -الشارع الرئيسي بحانب مدينة الطيبات, Ramallah, Palestine',
  'logo', 'https://souqpale.com/wp-content/uploads/2025/04/441197348_122131506200246271_3808186221957484360_n-1.jpg',
  'vat', '',
  'website', ''
)
WHERE key = 'store';

-- Update localization settings
UPDATE settings
SET value = jsonb_build_object(
  'language', 'ar',
  'currency', 'ILS',
  'dateFormat', 'dd/mm/yyyy',
  'timezone', 'Asia/Jerusalem'
)
WHERE key = 'localization';