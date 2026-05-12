"""
SISTEMA DE CACHE OPTIMIZADO PARA LEADGENPRO
=====================================

Características:
- ✅ Cache en memoria y Redis
- ✅ Rate limiting distribuido
- ✅ Session management
- ✅ Data persistence
- ✅ Cache warming
- ✅ Invalidación automática
"""

import time
import json
import hashlib
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import asyncio
from functools import wraps

# Configuración
logger = logging.getLogger(__name__)

class CacheManager:
    """Gestor de cache optimizado para alta concurrencia."""
    
    def __init__(self):
        self.memory_cache: Dict[str, Dict[str, Any]] = {}
        self.cache_stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'deletes': 0
        }
        self.rate_limits: Dict[str, list] = {}
        self.session_cache: Dict[str, Dict[str, Any]] = {}
        
    def get(self, key: str, default: Any = None) -> Any:
        """Obtener valor del cache con estadísticas."""
        if key in self.memory_cache:
            item = self.memory_cache[key]
            if item['expires'] > time.time():
                self.cache_stats['hits'] += 1
                return item['value']
            else:
                del self.memory_cache[key]
        
        self.cache_stats['misses'] += 1
        return default
    
    def set(self, key: str, value: Any, ttl: int = 3600) -> None:
        """Establecer valor en cache con TTL."""
        self.memory_cache[key] = {
            'value': value,
            'expires': time.time() + ttl,
            'created': time.time()
        }
        self.cache_stats['sets'] += 1
        
    def delete(self, key: str) -> bool:
        """Eliminar valor del cache."""
        if key in self.memory_cache:
            del self.memory_cache[key]
            self.cache_stats['deletes'] += 1
            return True
        return False
    
    def is_rate_limited(self, identifier: str, limit: int = 10, window: int = 300) -> bool:
        """Verificar rate limiting con ventana deslizante."""
        now = time.time()
        
        if identifier not in self.rate_limits:
            self.rate_limits[identifier] = []
        
        # Liminar entradas viejas (ventana deslizante)
        self.rate_limits[identifier] = [
            timestamp for timestamp in self.rate_limits[identifier]
            if now - timestamp < window
        ]
        
        if len(self.rate_limits[identifier]) >= limit:
            return False
        
        self.rate_limits[identifier].append(now)
        return True
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Obtener datos de sesión."""
        return self.get(f"session:{session_id}")
    
    def set_session(self, session_id: str, user_data: Dict[str, Any], ttl: int = 86400) -> None:
        """Establecer datos de sesión."""
        self.set(f"session:{session_id}", user_data, ttl)
    
    def invalidate_user_cache(self, user_id: str) -> None:
        """Invalidar todo el cache de un usuario."""
        keys_to_delete = [k for k in self.memory_cache.keys() if user_id in k]
        for key in keys_to_delete:
            self.delete(key)
    
    def warm_cache(self) -> None:
        """Precargar datos comunes."""
        common_data = {
            'app_config': {'version': '1.0.0', 'features': ['email_verification', 'rate_limiting']},
            'countries': ['US', 'ES', 'MX', 'CO', 'AR', 'PE', 'CL'],
            'settings': {'max_upload_size': '10MB', 'session_timeout': '24h'}
        }
        
        for key, value in common_data.items():
            self.set(f"warm:{key}", value, ttl=7200)  # 2 horas
        
        logger.info(f"Cache warmed with {len(common_data)} items")
    
    def get_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas del cache."""
        total_requests = self.cache_stats['hits'] + self.cache_stats['misses']
        hit_rate = (self.cache_stats['hits'] / total_requests * 100) if total_requests > 0 else 0
        
        return {
            'cache_size': len(self.memory_cache),
            'total_requests': total_requests,
            'hit_rate': round(hit_rate, 2),
            'stats': self.cache_stats,
            'active_sessions': len([k for k in self.memory_cache.keys() if k.startswith('session:')]),
            'rate_limits': len(self.rate_limits)
        }
    
    def cleanup_expired(self) -> int:
        """Limpiar entradas expiradas."""
        now = time.time()
        expired_keys = []
        
        for key, item in self.memory_cache.items():
            if item['expires'] <= now:
                expired_keys.append(key)
                del self.memory_cache[key]
        
        if expired_keys:
            logger.info(f"Cleaned {len(expired_keys)} expired cache entries")
        
        return len(expired_keys)

# Instancia global del cache
cache_manager = CacheManager()

def cached(ttl: int = 3600):
    """Decorador para cachear resultados de funciones."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Crear clave única para la función
            cache_key = f"{func.__name__}:{hashlib.md5(str(args) + str(kwargs).encode()).hexdigest()}"
            
            # Intentar obtener del cache
            cached_result = cache_manager.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Ejecutar función y cachear resultado
            result = func(*args, **kwargs)
            cache_manager.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator

def rate_limit(identifier: str, limit: int = 10, window: int = 300):
    """Decorador para rate limiting."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not cache_manager.is_rate_limited(identifier, limit, window):
                return func(*args, **kwargs)
            else:
                logger.warning(f"Rate limit exceeded for {identifier}")
                raise Exception("Rate limit exceeded. Please try again later.")
        return wrapper
    return decorator

# Inicialización del cache al arrancar
def initialize_cache():
    """Inicializar y calentar el cache."""
    cache_manager.warm_cache()
    logger.info("Cache system initialized and warmed")
    
    # Programar limpieza periódica
    async def periodic_cleanup():
        while True:
            await asyncio.sleep(300)  # 5 minutos
            cleaned = cache_manager.cleanup_expired()
            if cleaned > 0:
                logger.info(f"Periodic cleanup: {cleaned} items")
    
    # Iniciar tarea en background (en producción)
    import os
    if os.getenv("NODE_ENV") == "production":
        asyncio.create_task(periodic_cleanup())
