import sys
from loguru import logger


def configure_logging() -> None:
    logger.remove()
    logger.add(sys.stdout, level="DEBUG", serialize=False, backtrace=True, diagnose=False)
