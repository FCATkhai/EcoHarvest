import requests
from typing import Any, Dict, List
from langchain.tools import tool

BACKEND_URL = "http://localhost:5000/api"

@tool
def search_products(query: str) -> List[Dict[str, Any]]:
    """
    Gọi backend để tìm sản phẩm theo tên
    
    Args:
        query (str): Tên sản phẩm cần tìm
    """
    try:
        res = requests.get(f"{BACKEND_URL}/products", params={"search": query})
        res.raise_for_status()
        return res.json().get("data", [])
    except Exception as e:
        return [{"error": str(e)}]

@tool
def get_product_detail(product_id: str) -> Dict[str, Any]:
    """
    Gọi backend để lấy chi tiết 1 sản phẩm
    
    Args:
        product_id (str): ID của sản phẩm cần lấy chi tiết
    """
    try:
        res = requests.get(f"{BACKEND_URL}/products/{product_id}")
        res.raise_for_status()
        return res.json().get("data", {})
    except Exception as e:
        return {"error": str(e)}

tools = [search_products, get_product_detail]