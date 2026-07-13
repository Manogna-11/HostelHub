UPDATE hostel_images SET url = CASE category
  WHEN 'Building' THEN 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'
  WHEN 'Rooms' THEN 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80'
  WHEN 'Mess' THEN 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'
  WHEN 'Study Area' THEN 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80'
  WHEN 'Bathroom' THEN 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80'
  WHEN 'Reception' THEN 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'
  WHEN 'Security Area' THEN 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80'
  ELSE 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'
END;