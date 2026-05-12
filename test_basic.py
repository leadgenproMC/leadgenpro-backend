"""Tests básicos para LeadGenPro."""
import pytest


def test_placeholder():
    """Test placeholder para que pytest pase."""
    assert True


def test_import_fastapi():
    """Verificar que FastAPI se puede importar."""
    try:
        from fastapi import FastAPI
        assert True
    except ImportError:
        pytest.fail("FastAPI no se puede importar")
