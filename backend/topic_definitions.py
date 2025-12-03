"""
Shared topic metadata used for seeding the database.
"""

from typing import Iterable

# Base definitions used across seeding flows
TOPIC_DEFINITIONS = (
    {
        "id": "basic-variables",
        "name": "Basic Variables",
        "is_visible": True,
        "order_index": 1,
        "total_subtopics": 9,
        "subtopics": ["VariableBasics", "MultipleAssignment", "TypeConversion"],
    },
    {
        "id": "basic-functions",
        "name": "Basic Functions",
        "is_visible": True,
        "order_index": 2,
        "total_subtopics": 10,
        "subtopics": ["FunctionDefinition", "ReturnValues", "FunctionArguments"],
    },
    {
        "id": "strings",
        "name": "Strings",
        "is_visible": True,
        "order_index": 3,
        "total_subtopics": 8,
        "subtopics": ["StringIndexing", "StringMethods", "StringFormatting"],
    },
    {
        "id": "conditionals",
        "name": "Conditionals",
        "is_visible": True,
        "order_index": 4,
        "total_subtopics": 7,
        "subtopics": ["IfStatements", "IfElse", "NestedIf"],
    },
    {
        "id": "loops",
        "name": "Loops",
        "is_visible": True,
        "order_index": 5,
        "total_subtopics": 9,
        "subtopics": ["ForLoops", "WhileLoops", "LoopControl"],
    },
    {
        "id": "lists",
        "name": "Lists",
        "is_visible": True,
        "order_index": 6,
        "total_subtopics": 8,
        "subtopics": ["ListBasics", "ListMethods", "ListComprehensions"],
    },
    {
        "id": "tuples",
        "name": "Tuples",
        "is_visible": True,
        "order_index": 7,
        "total_subtopics": 6,
        "subtopics": ["TupleBasics", "TupleUnpacking", "TupleLength"],
    },
    {
        "id": "dictionaries",
        "name": "Dictionaries",
        "is_visible": True,
        "order_index": 8,
        "total_subtopics": 7,
        "subtopics": ["DictBasics", "DictIteration", "DictMethods"],
    },
    {
        "id": "errors",
        "name": "Errors & Exceptions",
        "is_visible": True,
        "order_index": 9,
        "total_subtopics": 5,
        "subtopics": ["TryExcept", "Raise", "CustomErrors"],
    },
)

DEFAULT_TOPICS: Iterable[tuple[str, str, bool, int]] = tuple(
    (topic["id"], topic["name"], topic["is_visible"], topic["order_index"])
    for topic in TOPIC_DEFINITIONS
)

TOPIC_META_BY_ID = {topic["id"]: topic for topic in TOPIC_DEFINITIONS}
