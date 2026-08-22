from app.services.docker_sandbox_service import run_python_in_sandbox


source_code = """
class Solution:
    def infiniteLoop(self):
        while True:
            pass
"""


result = run_python_in_sandbox(
    source_code=source_code,
    function_name="infiniteLoop",
    arguments=[],
    time_limit=2.0,
)

print(result)