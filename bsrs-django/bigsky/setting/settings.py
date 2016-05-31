GENERAL_SETTINGS = {
    "company_code": {
        "value": "One",
    },
    "company_name": {
        "value": "Andy's Pianos",
    },
    "dashboard_text": {
        "value": "Welcome",
    },
    "login_grace": {
        "value": 1,
    },
    "exchange_rates": {
        "value": 1.0,
    },
    "modules": {
        "value": {
            "tickets": True,
            "work_orders": True,
            "invoices": True
        },
    },
    "test_mode": {
        "value": False,
    },
    "test_contractor_email": {
        "value": "test@bigskytech.com",
    },
    "test_contractor_phone": {
        "value": "+18587155000",
    },
    "dt_start_key": {
        "value": "Start",
    }
}

ROLE_SETTINGS = {
    "create_all": {
        "value": True,
    },
    "accept_assign": {
        "value": False,
    },
    "accept_notify": {
        "value": False,
    },
    "dashboard_text": {
        "inherits_from": "general",
    }
}

PERSON_SETTINGS = {
    "accept_assign": {
        "inherits_from": "role"
    },
    "accept_notify": {
        "inherits_from": "role"
    },
    "password_one_time": {
        "value": False,
    }
}
