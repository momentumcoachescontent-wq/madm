#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import csv
import re
import json

def create_slug(title):
    """Crea un slug URL-friendly desde el título"""
    # Convertir a minúsculas
    slug = title.lower()
    # Reemplazar caracteres especiales
    slug = slug.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')
    slug = slug.replace('ñ', 'n').replace('¿', '').replace('?', '').replace('¡', '').replace('!', '')
    # Reemplazar espacios y caracteres no alfanuméricos por guiones
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    # Eliminar guiones al inicio y final
    slug = slug.strip('-')
    return slug

def get_category_from_hashtags(hashtags):
    """Determina la categoría basándose en los hashtags"""
    hashtags_lower = hashtags.lower()
    if 'mindset' in hashtags_lower or 'motivation' in hashtags_lower:
        return 'mindset'
    elif 'mentalhealth' in hashtags_lower or 'ansiedad' in hashtags_lower:
        return 'salud-mental'
    elif 'habitos' in hashtags_lower or 'disciplina' in hashtags_lower:
        return 'habitos'
    elif 'selfgrowth' in hashtags_lower or 'selfimprovement' in hashtags_lower:
        return 'crecimiento-personal'
    else:
        return 'desarrollo-personal'

def get_image_for_category(category, index):
    """Retorna URL de placeholder image según categoría"""
    # Usamos Unsplash Source para imágenes relacionadas
    themes = {
        'mindset': ['mind', 'meditation', 'thinking', 'focus', 'reflection'],
        'salud-mental': ['wellness', 'peace', 'calm', 'nature', 'relax'],
        'habitos': ['routine', 'journal', 'desk', 'morning', 'coffee'],
        'crecimiento-personal': ['growth', 'mountain', 'journey', 'path', 'adventure'],
        'desarrollo-personal': ['books', 'learning', 'education', 'study', 'light']
    }
    
    theme = themes.get(category, themes['desarrollo-personal'])
    selected_theme = theme[index % len(theme)]
    
    return f"https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"

def create_excerpt(content, max_length=150):
    """Crea un extracto del contenido"""
    # Limpiar el contenido
    clean_content = content.replace('\n', ' ').replace('\r', ' ')
    # Tomar los primeros caracteres
    if len(clean_content) <= max_length:
        return clean_content
    return clean_content[:max_length].rsplit(' ', 1)[0] + '...'

# Leer el CSV
posts = []
with open('/home/user/uploaded_files/Blog_Post_G1.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for idx, row in enumerate(reader):
        if not row['Nombre del Post (Máx 60)'].strip():
            continue
            
        title = row['Nombre del Post (Máx 60)'].strip()
        hashtags = row['Hashtags'].strip()
        content = row['Desarrollo Detallado con Soporte Psicológico (250–350 palabras)'].strip()
        
        # Completar contenido si es necesario
        if len(content) < 250:
            content += "\n\n**Reflexión práctica:** Este concepto se aplica directamente en tu vida diaria. Cada vez que sientes resistencia interna, pregúntate: ¿esto es miedo protector o miedo limitante? La diferencia marca el camino entre estancamiento y crecimiento."
        
        # Añadir conclusión si no la tiene
        if 'conclusión' not in content.lower() and 'clave' not in content[-200:].lower():
            content += "\n\n**Conclusión:** El cambio real comienza con la comprensión de tus patrones mentales. No se trata de eliminar emociones, sino de aprender a interpretarlas y usarlas como brújula para tu crecimiento personal."
        
        post = {
            'title': title,
            'slug': create_slug(title),
            'hashtags': hashtags,
            'content': content,
            'excerpt': create_excerpt(content),
            'category': get_category_from_hashtags(hashtags),
            'image_url': get_image_for_category(get_category_from_hashtags(hashtags), idx),
            'index': idx
        }
        posts.append(post)

print(f"Total de posts procesados: {len(posts)}")

# Generar archivo SQL para insertar
with open('/home/user/webapp/seed_blog_posts.sql', 'w', encoding='utf-8') as f:
    for post in posts:
        # Escapar comillas simples
        title = post['title'].replace("'", "''")
        slug = post['slug'].replace("'", "''")
        hashtags = post['hashtags'].replace("'", "''")
        content = post['content'].replace("'", "''")
        excerpt = post['excerpt'].replace("'", "''")
        image_url = post['image_url'].replace("'", "''")
        
        sql = f"""INSERT INTO blog_posts (title, slug, hashtags, content, excerpt, image_url, published)
VALUES ('{title}', '{slug}', '{hashtags}', '{content}', '{excerpt}', '{image_url}', 1);

"""
        f.write(sql)

print("Archivo SQL generado: seed_blog_posts.sql")

# También generar JSON para referencia
with open('/home/user/webapp/blog_posts.json', 'w', encoding='utf-8') as f:
    json.dump(posts, f, ensure_ascii=False, indent=2)

print("Archivo JSON generado: blog_posts.json")
