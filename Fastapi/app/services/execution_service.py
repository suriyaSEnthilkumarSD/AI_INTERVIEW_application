from app.services.docker_sandbox_service import (
    run_python_in_sandbox,
)


def execute_python_code(
    source_code: str,
    function_name: str,
    parameter_names: list[str],
    test_cases: list[dict],
    time_limit: float = 2.0,
):
    execution_result = run_python_in_sandbox(
        source_code=source_code,
        function_name=function_name,
        parameter_names=parameter_names,
        test_cases=test_cases,
        time_limit=time_limit,
    )

    return execution_result