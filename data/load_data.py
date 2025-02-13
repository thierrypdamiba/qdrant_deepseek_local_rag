import json

def load_contracts():
    """Load contract data from data/contracts.txt"""
    with open('data/contracts.txt', 'r') as f:
        return json.load(f)

def load_tickets():
    """Load ticket data from data/tickets.txt"""
    with open('data/tickets.txt', 'r') as f:
        return json.load(f) 