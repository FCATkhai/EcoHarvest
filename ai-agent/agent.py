from dotenv import load_dotenv
load_dotenv()
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_agent
from langchain.agents.middleware import wrap_tool_call
from langchain.messages import ToolMessage
from tools import tools

GOOGLE_API_KEY = os.environ["GOOGLE_API_KEY"]

model = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", api_key=GOOGLE_API_KEY)

@wrap_tool_call
def handle_tool_errors(request, handler):
    """Handle tool execution errors with custom messages."""
    try:
        return handler(request)
    except Exception as e:
        # Return a custom error message to the model
        return ToolMessage(
            content=f"Tool error: Please check your input and try again. ({str(e)})",
            tool_call_id=request.tool_call["id"]
        )

system_prompt = """Bạn là một trợ lý ảo am hiểu về nông nghiệp và các sản phẩm nông sản. 
Hãy giúp người dùng tìm kiếm và cung cấp thông tin chi tiết về các sản phẩm nông sản từ hệ thống cửa hàng của chúng tôi. 
Sử dụng các công cụ tìm kiếm sản phẩm và lấy chi tiết sản phẩm khi cần thiết.
Hãy đảm bảo rằng bạn cung cấp thông tin chính xác và hữu ích cho người dùng.
Nếu bạn không chắc chắn về câu trả lời, hãy thận trọng và đề nghị người dùng kiểm tra lại thông tin từ nguồn chính thức.
"""

# response = model.invoke("Hello")
agent = create_agent(model=model, tools=tools, middleware=[handle_tool_errors], system_prompt=system_prompt)

# response = agent.invoke({
#     "messages": [{"role": "user", "content": "Xin chào, bạn có thể giúp tôi tìm sản phẩm bí giọt nước không?"}]
# })
# print(response)


# {'messages': [HumanMessage(content='Xin chào, bạn có thể giúp tôi tìm sản phẩm bí giọt nước không?', additional_kwargs={}, response_metadata={}, id='8bfd1d9e-f1a7-4878-96bf-e087683e02e5'), AIMessage(content='', additional_kwargs={'function_call': {'name': 'search_products', 'arguments': '{"query": "b\\u00ed gi\\u1ecdt n\\u01b0\\u1edbc"}'}}, response_metadata={'prompt_feedback': {'block_reason': 0, 'safety_ratings': []}, 'finish_reason': 'STOP', 'model_name': 'gemini-2.5-flash-lite', 'safety_ratings': [], 'model_provider': 'google_genai'}, id='lc_run--8253bfbc-3dcb-4473-8832-196ec6a2ec0d-0', tool_calls=[{'name': 'search_products', 'args': {'query': 'bí giọt nước'}, 'id': 'd63b5ca1-f8a3-4250-b9c5-89308565ffc1', 'type': 'tool_call'}], usage_metadata={'input_tokens': 261, 'output_tokens': 18, 'total_tokens': 279, 'input_token_details': {'cache_read': 0}}), ToolMessage(content='[{"id": "c792b188-f09d-414e-86b7-71ccaab42eb0", "name": "Bí Giọt Nước", "description": "Giống bí này có nguồn gốc xuất xứ từ Nhật Bản, sau này được đem trồng phổ biến ở nhiều nơi trên Thế Giới nhờ khí hậu thời tiết thuận tiện. Đặc biệt, bí giọt nước được trồng nhiều ở Đà Lạt. ", "categoryId": 1, 
# "price": 50000, "unit": "kg", "quantity": 13, "sold": 4, "origin": "Đà lạt", "status": 1, "isDeleted": 0, "createdAt": "2025-11-16T04:29:52.597Z", "updatedAt": "2025-11-19T08:50:07.336Z", "deletedAt": null, "image": {"id": 4, "productId": "c792b188-f09d-414e-86b7-71ccaab42eb0", "imageUrl": "https://vxthphghtseotlurcruy.supabase.co/storage/v1/object/public/product-images/c792b188-f09d-414e-86b7-71ccaab42eb0-1763278820830.jpg", "isPrimary": true, "altText": "bi-giot-nuoc-nong-san-dung-ha-chat-luong.jpg", "createdAt": "2025-11-16T07:40:22.762Z"}}]', name='search_products', id='30357d0a-be8d-4bb6-a687-2e2bfe817379', tool_call_id='d63b5ca1-f8a3-4250-b9c5-89308565ffc1'), AIMessage(content='Xin chào! Tôi tìm thấy sản phẩm "Bí Giọt Nước" với các thông tin chi tiết như sau:\n\n*   **Tên sản phẩm:** Bí Giọt Nước\n*   
# **Nguồn gốc:** Đà Lạt\n*   **Mô tả:** Giống bí này có nguồn gốc xuất xứ từ Nhật Bản, sau này được đem trồng phổ biến ở nhiều nơi trên Thế Giới nhờ khí hậu thời tiết thuận tiện. Đặc biệt, bí giọt nước được trồng nhiều ở Đà Lạt.\n*   **Giá:** 50.000 VNĐ/kg\n*   **Số lượng còn:** 13 kg\n\nBạn có muốn biết thêm thông tin gì về sản phẩm này không?', additional_kwargs={}, response_metadata={'prompt_feedback': {'block_reason': 0, 'safety_ratings': []}, 'finish_reason': 'STOP', 'model_name': 'gemini-2.5-flash-lite', 'safety_ratings': [], 'model_provider': 'google_genai'}, id='lc_run--9fc6fba6-26c0-47b4-b29c-76edb12832e2-0', usage_metadata={'input_tokens': 709, 'output_tokens': 150, 'total_tokens': 859, 'input_token_details': {'cache_read': 0}})]}


# from langchain_core.messages import HumanMessage, AIMessage
# messages = [{'role': 'user', 'content': 'xin chào'}, {'role': 'assistant', 'content': 'Chào bạn, tôi có thể giúp gì cho bạn hôm nay?'}, {'role': 'user', 'content': 'bên mình có gạo không'}]
# response = agent.invoke({
#     "messages": [HumanMessage(content=msg['content']) if msg['role']=='user' else AIMessage(content=msg['content']) for msg in messages]
# })
# print(response)