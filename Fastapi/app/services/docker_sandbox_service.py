import json
import subprocess

from app.core.config import settings


def create_runtime_error(
    error: str,
):
    return {
        "status": "Runtime Error",
        "error": error,
        "test_cases_passed": 0,
        "total_test_cases": 0,
        "execution_time": None,
        "memory_used": None,
        "results": [],
    }


def run_python_in_sandbox(
    source_code: str,
    function_name: str,
    parameter_names: list[str],
    test_cases: list[dict],
    time_limit: float = 2.0,
):
    input_data = {
        "source_code": source_code,
        "function_name": function_name,
        "parameter_names": parameter_names,
        "test_cases": test_cases,
        "time_limit": time_limit,
    }

    container_timeout = (
        time_limit * len(test_cases)
        + settings.sandbox_timeout_buffer
    )

    docker_command = [
        settings.docker_path,
        "run",
        "--rm",

        "--network",
        "none",

        "--memory",
        settings.sandbox_memory_limit,

        "--cpus",
        str(settings.sandbox_cpu_limit),

        "--pids-limit",
        str(settings.sandbox_pids_limit),

        "--read-only",

        "--tmpfs",
        (
            "/tmp:rw,noexec,nosuid,"
            f"size={settings.sandbox_tmpfs_size}"
        ),

        "-i",

        settings.sandbox_image,
    ]

    try:
        result = subprocess.run(
            docker_command,
            input=json.dumps(input_data),
            text=True,
            capture_output=True,
            timeout=container_timeout,
        )

        if result.returncode != 0:
            return create_runtime_error(
                "Sandbox execution failed"
            )

        return json.loads(result.stdout)

    except subprocess.TimeoutExpired:
        return {
            "status": "Time Limit Exceeded",
            "error": "Execution exceeded the time limit",
            "test_cases_passed": 0,
            "total_test_cases": len(test_cases),
            "execution_time": None,
            "memory_used": None,
            "results": [],
        }

    except json.JSONDecodeError:
        return create_runtime_error(
            "Invalid response from sandbox"
        )

    except Exception:
        return create_runtime_error(
            "Sandbox execution failed"
        )