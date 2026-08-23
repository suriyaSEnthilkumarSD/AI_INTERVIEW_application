import json
import resource
import signal
import sys
import time


class ExecutionTimeout(Exception):
    pass


def timeout_handler(signum, frame):
    raise ExecutionTimeout()


def get_memory_usage():
    memory_kb = resource.getrusage(
        resource.RUSAGE_SELF
    ).ru_maxrss

    memory_mb = memory_kb / 1024

    return round(memory_mb, 2)


def create_response(
    status: str,
    test_cases_passed: int = 0,
    total_test_cases: int = 0,
    execution_time: float | None = None,
    results: list | None = None,
    error: str | None = None,
):
    return {
        "status": status,
        "test_cases_passed": test_cases_passed,
        "total_test_cases": total_test_cases,
        "execution_time": execution_time,
        "memory_used": get_memory_usage(),
        "results": results or [],
        "error": error,
    }


def main():
    try:
        # Read execution data
        input_data = json.load(sys.stdin)

        source_code = input_data["source_code"]
        function_name = input_data["function_name"]
        parameter_names = input_data["parameter_names"]
        test_cases = input_data["test_cases"]

        # Time limit for each test case
        time_limit = input_data.get(
            "time_limit",
            2.0,
        )

        results = []
        passed_count = 0
        total_execution_time = 0.0
        total_test_cases = len(test_cases)

        # Execute submitted code once
        execution_namespace = {}
        exec(source_code, execution_namespace)

        # Validate Solution class
        if "Solution" not in execution_namespace:
            print(
                json.dumps(
                    create_response(
                        status="Runtime Error",
                        total_test_cases=total_test_cases,
                        error="Solution class not found",
                    )
                )
            )
            return

        # Create solution object
        solution = execution_namespace["Solution"]()

        # Validate function
        if not hasattr(solution, function_name):
            print(
                json.dumps(
                    create_response(
                        status="Runtime Error",
                        total_test_cases=total_test_cases,
                        error=(
                            f"Function '{function_name}' "
                            "not found"
                        ),
                    )
                )
            )
            return

        method = getattr(
            solution,
            function_name,
        )

        # Configure timeout handler
        signal.signal(
            signal.SIGALRM,
            timeout_handler,
        )

        # Execute every test case
        for test_case in test_cases:
            arguments = [
                test_case["input"][parameter_name]
                for parameter_name in parameter_names
            ]

            start_time = time.perf_counter()

            try:
                signal.setitimer(
                    signal.ITIMER_REAL,
                    time_limit,
                )

                actual_output = method(*arguments)

                test_execution_time = (
                    time.perf_counter() - start_time
                )

                total_execution_time += (
                    test_execution_time
                )

                expected_output = (
                    test_case["expectedOutput"]
                )

                if (
                    test_case.get("comparison")
                    == "unordered"
                ):
                    passed = (
                        sorted(actual_output)
                        == sorted(expected_output)
                    )
                else:
                    passed = (
                        actual_output
                        == expected_output
                    )

                if passed:
                    passed_count += 1

                results.append(
                    {
                        "test_case_id": test_case["id"],
                        "passed": passed,
                        "actual_output": actual_output,
                        "expected_output": expected_output,
                        "visibility": test_case.get(
                            "visibility"
                        ),
                    }
                )

            except ExecutionTimeout:
                test_execution_time = (
                    time.perf_counter() - start_time
                )

                total_execution_time += (
                    test_execution_time
                )

                results.append(
                    {
                        "test_case_id": test_case["id"],
                        "passed": False,
                        "error": (
                            "Execution exceeded "
                            "the time limit"
                        ),
                        "visibility": test_case.get(
                            "visibility"
                        ),
                    }
                )

                print(
                    json.dumps(
                        create_response(
                            status="Time Limit Exceeded",
                            test_cases_passed=passed_count,
                            total_test_cases=total_test_cases,
                            execution_time=(
                                total_execution_time
                            ),
                            results=results,
                            error=(
                                "Execution exceeded "
                                "the time limit"
                            ),
                        )
                    )
                )
                return

            except Exception as error:
                test_execution_time = (
                    time.perf_counter() - start_time
                )

                total_execution_time += (
                    test_execution_time
                )

                results.append(
                    {
                        "test_case_id": test_case["id"],
                        "passed": False,
                        "error": str(error),
                        "visibility": test_case.get(
                            "visibility"
                        ),
                    }
                )

                print(
                    json.dumps(
                        create_response(
                            status="Runtime Error",
                            test_cases_passed=passed_count,
                            total_test_cases=total_test_cases,
                            execution_time=(
                                total_execution_time
                            ),
                            results=results,
                            error=str(error),
                        )
                    )
                )
                return

            finally:
                # Always cancel the timer
                signal.setitimer(
                    signal.ITIMER_REAL,
                    0,
                )

        # Determine final status
        final_status = (
            "Accepted"
            if passed_count == total_test_cases
            else "Wrong Answer"
        )

        print(
            json.dumps(
                create_response(
                    status=final_status,
                    test_cases_passed=passed_count,
                    total_test_cases=total_test_cases,
                    execution_time=total_execution_time,
                    results=results,
                )
            )
        )

    except Exception as error:
        print(
            json.dumps(
                create_response(
                    status="Runtime Error",
                    error=str(error),
                )
            )
        )


if __name__ == "__main__":
    main()