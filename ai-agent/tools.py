import os
import requests
from typing import Any, Dict, List
from langchain.tools import tool
import dotenv
dotenv.load_dotenv()

BACKEND_URL = "http://localhost:5000/api"
AI_AGENT_API_KEY = os.environ["AI_AGENT_API_KEY"]

@tool
def search_products(query: str) -> List[Dict[str, Any]]:
    """
    Gọi backend để tìm sản phẩm theo tên
    
    Args:
        query (str): Tên sản phẩm cần tìm
    Returns:
        List[Dict[str, Any]]: Danh sách sản phẩm tìm được, có id của sản phẩm để lấy chi tiết
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

@tool
def get_user_cart(user_id: str) -> Dict[str, Any]:
    """
    Gọi backend để lấy giỏ hàng của người dùng
    
    Args:
        user_id (str): ID của người dùng
    """
    try:
        res = requests.get(f"{BACKEND_URL}/agent/cart/", headers={"x-api-key": AI_AGENT_API_KEY}, json={
            "userId": user_id
        })
        res.raise_for_status()
        return res.json().get("data", {})
    except Exception as e:
        return {"error": str(e)}

@tool
def add_product_to_cart(user_id: str, product_id: str, quantity: int) -> Dict[str, Any]:
    """
    Gọi backend để thêm sản phẩm vào giỏ hàng của người dùng
    
    Args:
        user_id (str): ID của người dùng
        product_id (str): ID của sản phẩm cần thêm
        quantity (int): Số lượng sản phẩm cần thêm
    """
    try:
        res = requests.post(f"{BACKEND_URL}/agent/cart/items", headers={"x-api-key": AI_AGENT_API_KEY}, json={
            "userId": user_id,
            "productId": product_id,
            "quantity": quantity
        })
        res.raise_for_status()
        return res.json().get("data", {})
    except Exception as e:
        return {"error": str(e)}

tools = [search_products, get_product_detail, get_user_cart, add_product_to_cart]