---
inclusion: manual
name: AgilePay Backend Architecture Blueprint
description: Complete backend architecture, database schema, API endpoints, and Lumx integration guide for AgilePay
---

# AgilePay — Complete Backend Architecture Blueprint

> **Version:** 2.0 | **Date:** October 2026
> **Frontend:** Next.js 14 App Router (JavaScript, no TypeScript)
> **Backend:** FastAPI (Python 3.12)
> **Database:** Supabase PostgreSQL + SQLAlchemy ORM + Alembic migrations
> **Auth:** Supabase Auth (frontend) + Supabase JWT verification (FastAPI)
> **Payments:** Lumx API (USDC on Base → local fiat via SWIFT/PIX/SPEI/SEPA/ACH/FPS)
> **Deploy:** Vercel (frontend) · Railway or Render (FastAPI) · Supabase (DB)

---

## 1. STACK OVERVIEW & SEPARATION OF CONCERNS

```
┌─────────────────────────────────┐     ┌──────────────────────────────────┐
│   FRONTEND — Next.js 14 (JS)    │     │   BACKEND — FastAPI (Python)     │
│   /agilepay (existing repo)     │     │   /agilepay-api (new repo)       │
│                                 │     │                                  │
│  • Pages & UI components        │────▶│  • REST API endpoints            │
│  • Supabase Auth client         │     │  • Business logic                │
│  • Supabase session cookies     │     │  • Lumx API integration          │
│  • Calls FastAPI via fetch()    │     │  • JWT verification              │
│  • Realtime via Supabase SDK    │     │  • Webhook ingestion             │
└─────────────────────────────────┘     └──────────────────────────────────┘
                                                      │
                              ┌───────────────────────┼───────────────────┐
                              │                       │                   │
                    ┌─────────▼──────┐    ┌───────────▼──────┐  ┌────────▼──────┐
                    │ Supabase       │    │ Lumx API          │  │ Resend        │
                    │ PostgreSQL     │    │ (payments)        │  │ (email)       │
                    └────────────────┘    └──────────────────┘  └───────────────┘
```

### Auth flow
1. User signs up / logs in on Next.js frontend via `supabase.auth.signInWithPassword()`
2. Supabase issues a JWT and stores it in a secure cookie
3. Frontend sends the JWT as `Authorization: Bearer <token>` on every FastAPI call
4. FastAPI verifies the JWT using `SUPABASE_JWT_SECRET` — no database round-trip needed
5. Developer SDK calls use `Authorization: Bearer sk_live_xxx` (API keys, not JWTs)

---

## 2. FOLDER STRUCTURE

```
agilepay-api/
├── app/
│   ├── main.py                  ← FastAPI app init, CORS, router registration
│   ├── config.py                ← Settings via pydantic-settings
│   ├── database.py              ← SQLAlchemy engine + session factory
│   │
│   ├── models/                  ← SQLAlchemy ORM models (one file per model)
│   │   ├── __init__.py
│   │   ├── merchant.py
│   │   ├── api_key.py
│   │   ├── destination.py
│   │   ├── recipient.py
│   │   ├── transaction.py
│   │   ├── payment_link.py
│   │   ├── partner_fee_config.py
│   │   └── webhook_log.py
│   │
│   ├── schemas/                 ← Pydantic request/response models
│   │   ├── auth.py
│   │   ├── destination.py
│   │   ├── charge.py
│   │   ├── link.py
│   │   ├── transaction.py
│   │   └── remittance.py
│   │
│   ├── routers/                 ← FastAPI route handlers
│   │   ├── auth.py              POST /auth/signup
│   │   ├── merchants.py         GET  /merchants/me, POST /merchants/me/kyc
│   │   ├── api_keys.py          GET/POST/DELETE /api-keys
│   │   ├── destinations.py      GET/POST /destinations
│   │   ├── charges.py           POST/GET /charges  ← DEVELOPER SDK
│   │   ├── links.py             GET/POST /links
│   │   ├── transactions.py      GET /transactions
│   │   ├── checkout.py          POST /pay/{link_id}  ← public hosted checkout
│   │   ├── webhooks.py          POST /webhooks/lumx
│   │   └── remittance.py        POST /remittance/*   ← INDIVIDUAL only
│   │
│   ├── services/                ← Business logic + Lumx API calls
│   │   ├── lumx.py              ← Lumx HTTP client
│   │   ├── charges.py
│   │   ├── destinations.py
│   │   └── remittance.py
│   │
│   └── lib/
│       ├── auth.py              ← JWT + API key verification dependencies
│       ├── rails.py             ← RAIL_CONFIG country → rail → currency
│       ├── validators.py        ← Per-rail identifier validators
│       └── ids.py               ← charge ID / link ID generators
│
├── alembic/                     ← DB migrations
│   ├── env.py
│   └── versions/
│
├── requirements.txt
├── .env
└── Procfile                     ← for Railway/Render deployment
```

---

## 3. DATABASE SCHEMA (SQLAlchemy Models)

### 3.1 Base + Enums

```python
# app/models/__init__.py
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Enum
import enum

class Base(DeclarativeBase):
    pass

class AccountType(str, enum.Enum):
    DEVELOPER  = "DEVELOPER"   # API keys, SDK, programmatic charges
    MERCHANT   = "MERCHANT"    # No-code: payment links + dashboard only
    INDIVIDUAL = "INDIVIDUAL"  # Remittance: fund wallet, send to recipients

class KycStatus(str, enum.Enum):
    NOT_STARTED      = "NOT_STARTED"
    PENDING          = "PENDING"
    APPROVED         = "APPROVED"
    RFI              = "RFI"
    FINAL_REJECTION  = "FINAL_REJECTION"

class MerchantStatus(str, enum.Enum):
    PENDING   = "PENDING"
    ACTIVE    = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    CLOSED    = "CLOSED"

class KeyEnvironment(str, enum.Enum):
    TEST = "TEST"
    LIVE = "LIVE"

class Rail(str, enum.Enum):
    PIX     = "PIX"      # Brazil — BRL
    SPEI    = "SPEI"     # Mexico — MXN
    SEPA    = "SEPA"     # Eurozone — EUR
    ACH     = "ACH"      # USA — USD
    FEDWIRE = "FEDWIRE"  # USA large/same-day — USD
    FPS     = "FPS"      # UK — GBP
    SWIFT   = "SWIFT"    # International fallback — USD

class DestinationStatus(str, enum.Enum):
    PENDING  = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class RecipientRelationship(str, enum.Enum):
    RELATIVE = "RELATIVE"
    FRIEND   = "FRIEND"

class TransactionType(str, enum.Enum):
    OFF_RAMP = "OFF_RAMP"
    ON_RAMP  = "ON_RAMP"
    TRANSFER = "TRANSFER"

class TransactionStatus(str, enum.Enum):
    PENDING                 = "PENDING"
    AWAITING_FUNDS          = "AWAITING_FUNDS"
    PROCESSING              = "PROCESSING"
    TRANSFERRING_STABLECOIN = "TRANSFERRING_STABLECOIN"
    TRADING                 = "TRADING"
    TRANSFERRING_FIAT       = "TRANSFERRING_FIAT"
    COMPLETED               = "COMPLETED"
    FAILED                  = "FAILED"
    CANCELLED               = "CANCELLED"
    REFUNDED                = "REFUNDED"

class WebhookDirection(str, enum.Enum):
    INBOUND  = "INBOUND"
    OUTBOUND = "OUTBOUND"
```

### 3.2 Merchant

```python
# app/models/merchant.py
from sqlalchemy import Column, String, Boolean, DateTime, ARRAY, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid
from app.models import Base, AccountType, KycStatus, MerchantStatus

class Merchant(Base):
    __tablename__ = "merchants"

    id               = Column(UUID(as_uuid=True), primary_key=True)
    # id = Supabase Auth user UUID — set explicitly on insert, no server default
    email            = Column(String, unique=True, nullable=False)
    full_name        = Column(String, nullable=False)
    business_name    = Column(String)
    business_type    = Column(String, default="INDIVIDUAL")
    country          = Column(String, default="GH")

    # Lumx
    lumx_customer_id   = Column(String, unique=True)
    lumx_wallet_address = Column(String)

    # KYC
    kyc_status       = Column(SAEnum(KycStatus), default=KycStatus.NOT_STARTED)
    kyc_sumsub_link  = Column(String)
    tos_accepted_at  = Column(DateTime(timezone=True))

    # Account flags
    account_type     = Column(SAEnum(AccountType), default=AccountType.DEVELOPER)
    status           = Column(SAEnum(MerchantStatus), default=MerchantStatus.PENDING)
    is_live          = Column(Boolean, default=False)
    is_sandbox       = Column(Boolean, default=True)

    # INDIVIDUAL remittance fields (null for DEVELOPER/MERCHANT)
    tax_id                 = Column(String)
    birth_date             = Column(DateTime(timezone=True))
    phone                  = Column(String)
    address_line1          = Column(String)
    address_city           = Column(String)
    address_state          = Column(String)
    address_postal_code    = Column(String)
    address_country        = Column(String)
    monthly_volume_usd     = Column(String)
    transaction_volume_usd = Column(String)
    source_of_funds        = Column(String)
    professional_situation = Column(String)
    occupation             = Column(String)
    jurisdictions          = Column(ARRAY(String), default=list)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    # Relations
    api_keys          = relationship("ApiKey", back_populates="merchant", cascade="all, delete")
    destinations      = relationship("Destination", back_populates="merchant", cascade="all, delete")
    transactions      = relationship("Transaction", back_populates="merchant")
    payment_links     = relationship("PaymentLink", back_populates="merchant", cascade="all, delete")
    partner_fee_config = relationship("PartnerFeeConfig", back_populates="merchant",
                                      uselist=False, cascade="all, delete")
    recipients        = relationship("Recipient", back_populates="merchant", cascade="all, delete")
```

### 3.3 ApiKey

```python
# app/models/api_key.py
from sqlalchemy import Column, String, Boolean, DateTime, ARRAY, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid
from app.models import Base, KeyEnvironment

class ApiKey(Base):
    __tablename__ = "api_keys"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    merchant_id    = Column(UUID(as_uuid=True), ForeignKey("merchants.id", ondelete="CASCADE"),
                            nullable=False)
    # Full key shown ONCE at creation — only prefix + bcrypt hash stored
    key_prefix     = Column(String, nullable=False)   # "sk_live_" or "sk_test_"
    key_hash       = Column(String, unique=True, nullable=False)  # bcrypt hash
    last_four_chars = Column(String, nullable=False)  # for UI display

    name           = Column(String)
    environment    = Column(SAEnum(KeyEnvironment), default=KeyEnvironment.TEST)
    scopes         = Column(ARRAY(String), default=list)
    is_active      = Column(Boolean, default=True)
    last_used_at   = Column(DateTime(timezone=True))
    expires_at     = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    revoked_at = Column(DateTime(timezone=True))

    merchant = relationship("Merchant", back_populates="api_keys")
```

### 3.4 Destination

```python
# app/models/destination.py
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime, timezone
import uuid
from app.models import Base, Rail, DestinationStatus

class Destination(Base):
    __tablename__ = "destinations"

    id                  = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    merchant_id         = Column(UUID(as_uuid=True), ForeignKey("merchants.id", ondelete="CASCADE"),
                                 nullable=False)
    lumx_destination_id = Column(String, unique=True)

    label        = Column(String)
    rail         = Column(SAEnum(Rail), nullable=False)
    currency     = Column(String, nullable=False)   # ISO 4217
    country      = Column(String, nullable=False)   # ISO 3166-1 alpha-2
    # Flexible per-rail identifier blob — mirrors Lumx payload structure
    # PIX:   {"keyType": "EMAIL", "keyValue": "..."}
    # SPEI:  {"clabe": "..."}
    # SEPA:  {"iban": "...", "bic": "..."}
    # ACH:   {"routingNumber": "...", "accountNumber": "...", "accountType": "CHECKING"}
    # FPS:   {"sortCode": "...", "accountNumber": "..."}
    # SWIFT: {"accountNumber": "...", "swiftCode": "...", "bankName": "..."}
    identifier   = Column(JSONB, nullable=False)

    holder_name         = Column(String, nullable=False)
    holder_relationship = Column(String, default="SELF")

    status     = Column(SAEnum(DestinationStatus), default=DestinationStatus.PENDING)
    is_default = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    merchant     = relationship("Merchant", back_populates="destinations")
    transactions = relationship("Transaction", back_populates="destination")
```

### 3.5 Recipient (INDIVIDUAL only)

```python
# app/models/recipient.py
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime, timezone
import uuid
from app.models import Base, Rail, DestinationStatus, RecipientRelationship

class Recipient(Base):
    __tablename__ = "recipients"

    id                  = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    merchant_id         = Column(UUID(as_uuid=True), ForeignKey("merchants.id", ondelete="CASCADE"),
                                 nullable=False)
    lumx_destination_id = Column(String, unique=True)

    full_name    = Column(String, nullable=False)
    email        = Column(String)
    phone        = Column(String)

    # RELATIVE or FRIEND — key compliance distinction vs SELF on Destination
    relationship = Column(SAEnum(RecipientRelationship), nullable=False)

    rail       = Column(SAEnum(Rail), nullable=False)
    currency   = Column(String, nullable=False)
    country    = Column(String, nullable=False)
    identifier = Column(JSONB, nullable=False)

    status = Column(SAEnum(DestinationStatus), default=DestinationStatus.PENDING)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    merchant    = relationship("Merchant", back_populates="recipients")
    remittances = relationship("Transaction", back_populates="recipient",
                               foreign_keys="Transaction.recipient_id")
```

### 3.6 Transaction

```python
# app/models/transaction.py
from sqlalchemy import Column, String, Boolean, DateTime, Numeric, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime, timezone
import uuid
from app.models import Base, TransactionType, TransactionStatus

class Transaction(Base):
    __tablename__ = "transactions"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    merchant_id     = Column(UUID(as_uuid=True), ForeignKey("merchants.id"), nullable=False)
    destination_id  = Column(UUID(as_uuid=True), ForeignKey("destinations.id"))
    payment_link_id = Column(UUID(as_uuid=True), ForeignKey("payment_links.id"))
    recipient_id    = Column(UUID(as_uuid=True), ForeignKey("recipients.id"))

    charge_id           = Column(String, unique=True, nullable=False)  # "chg_xxx"
    lumx_transaction_id = Column(String, unique=True)

    source_amount   = Column(Numeric(18, 6), nullable=False)
    source_currency = Column(String, default="USDC")
    target_amount   = Column(Numeric(18, 6))
    target_currency = Column(String)            # set from destination currency at creation
    exchange_rate   = Column(Numeric(18, 6))

    # Remittance — locked exchange rate fields
    lumx_exchange_rate_id    = Column(String)
    exchange_rate_locked_at  = Column(DateTime(timezone=True))
    exchange_rate_expires_at = Column(DateTime(timezone=True))
    final_target_amount      = Column(Numeric(18, 6))
    final_exchange_rate      = Column(Numeric(18, 6))

    platform_fee_cents = Column(String)
    platform_fee_rate  = Column(Numeric(5, 4))

    type       = Column(SAEnum(TransactionType), default=TransactionType.OFF_RAMP)
    purpose    = Column(String, default="TRADE_TRANSACTIONS")
    blockchain = Column(String, default="BASE")
    status     = Column(SAEnum(TransactionStatus), default=TransactionStatus.PENDING)

    payer_name  = Column(String)
    payer_email = Column(String)
    payer_phone = Column(String)

    description     = Column(String)
    reference_id    = Column(String)
    memo            = Column(String)
    metadata        = Column(JSONB, default=dict)
    idempotency_key = Column(String, unique=True)

    created_at   = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at   = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                          onupdate=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True))
    failed_at    = Column(DateTime(timezone=True))

    merchant     = relationship("Merchant", back_populates="transactions")
    destination  = relationship("Destination", back_populates="transactions")
    payment_link = relationship("PaymentLink", back_populates="transactions")
    recipient    = relationship("Recipient", back_populates="remittances",
                                foreign_keys=[recipient_id])
    webhook_logs = relationship("WebhookLog", back_populates="transaction")
```

### 3.7 PaymentLink

```python
# app/models/payment_link.py
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid
from app.models import Base

class PaymentLink(Base):
    __tablename__ = "payment_links"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    merchant_id = Column(UUID(as_uuid=True), ForeignKey("merchants.id", ondelete="CASCADE"),
                         nullable=False)

    link_id     = Column(String, unique=True, nullable=False)  # "lnk_xxx" — used in /pay/[linkId]
    title       = Column(String, nullable=False)
    description = Column(String)

    amount_cents     = Column(Integer)    # null = buyer enters amount
    currency         = Column(String, default="USD")
    is_fixed_amount  = Column(Boolean, default=True)
    min_amount_cents = Column(Integer)
    max_amount_cents = Column(Integer)

    default_destination_id = Column(UUID(as_uuid=True), ForeignKey("destinations.id"))

    is_active  = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True))
    max_uses   = Column(Integer)
    use_count  = Column(Integer, default=0)

    success_url = Column(String)
    cancel_url  = Column(String)
    logo_url    = Column(String)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    merchant     = relationship("Merchant", back_populates="payment_links")
    transactions = relationship("Transaction", back_populates="payment_link")
```

### 3.8 WebhookLog

```python
# app/models/webhook_log.py
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime, timezone
import uuid
from app.models import Base, WebhookDirection

class WebhookLog(Base):
    __tablename__ = "webhook_logs"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"))

    direction        = Column(SAEnum(WebhookDirection), nullable=False)
    lumx_event_id    = Column(String, unique=True)   # deduplication key
    event_type       = Column(String, nullable=False)

    source_ip        = Column(String)
    endpoint         = Column(String, nullable=False)
    http_method      = Column(String, default="POST")
    raw_payload      = Column(JSONB, nullable=False)
    signature_header = Column(String)
    signature_valid  = Column(Boolean)

    response_status  = Column(Integer)
    response_body    = Column(Text)
    processing_error = Column(Text)

    retry_count  = Column(Integer, default=0)
    next_retry_at = Column(DateTime(timezone=True))
    processed_at  = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    transaction = relationship("Transaction", back_populates="webhook_logs")
```

---

## 4. FASTAPI APP SETUP

### 4.1 main.py

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, merchants, api_keys, destinations, charges, links, \
                        transactions, checkout, webhooks, remittance
from app.config import settings

app = FastAPI(title="AgilePay API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],  # Next.js origin only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route registration
app.include_router(auth.router,         prefix="/v1/auth",         tags=["Auth"])
app.include_router(merchants.router,    prefix="/v1/merchants",    tags=["Merchants"])
app.include_router(api_keys.router,     prefix="/v1/api-keys",     tags=["API Keys"])
app.include_router(destinations.router, prefix="/v1/destinations", tags=["Destinations"])
app.include_router(charges.router,      prefix="/v1/charges",      tags=["Charges"])
app.include_router(links.router,        prefix="/v1/links",        tags=["Payment Links"])
app.include_router(transactions.router, prefix="/v1/transactions", tags=["Transactions"])
app.include_router(checkout.router,     prefix="/pay",             tags=["Checkout"])
app.include_router(webhooks.router,     prefix="/v1/webhooks",     tags=["Webhooks"])
app.include_router(remittance.router,   prefix="/v1/remittance",   tags=["Remittance"])
```

### 4.2 config.py

```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # Supabase
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_JWT_SECRET: str   # used to verify JWTs from Supabase Auth

    # Lumx
    LUMX_API_KEY: str
    LUMX_BASE_URL: str = "https://api-sandbox.lumx.io"
    LUMX_PARTNER_FEE_ID: str
    LUMX_WEBHOOK_SECRET: str
    LUMX_TREASURY_WALLET: str

    # App
    FRONTEND_URL: str = "http://localhost:3000"
    ENV: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
```

### 4.3 database.py

```python
# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## 5. AUTHENTICATION

### 5.1 Supabase JWT verification (dashboard routes)

```python
# app/lib/auth.py
import jwt
from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.merchant import Merchant
from app.models.api_key import ApiKey
from app.config import settings
import bcrypt

# ── Dashboard auth — verifies Supabase JWT ────────────────────────────────────
def get_current_merchant(
    authorization: str = Header(...),
    db: Session = Depends(get_db)
) -> Merchant:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization[7:]

    # Skip JWT verification for API keys — they start with sk_
    if token.startswith("sk_"):
        raise HTTPException(status_code=401, detail="Use API key auth for SDK routes")

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")
    merchant = db.query(Merchant).filter(Merchant.id == user_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")

    return merchant


# ── API key auth — verifies sk_live_xxx / sk_test_xxx (SDK routes) ────────────
class ApiKeyContext:
    def __init__(self, merchant_id: str, environment: str, scopes: list):
        self.merchant_id = merchant_id
        self.environment = environment
        self.scopes      = scopes

def get_api_key_context(
    authorization: str = Header(...),
    db: Session = Depends(get_db)
) -> ApiKeyContext:
    if not authorization.startswith("Bearer sk_"):
        raise HTTPException(status_code=401, detail="Invalid API key format")

    raw_key = authorization[7:]

    import re
    if not re.match(r"^sk_(test|live)_[A-Za-z0-9]{32}$", raw_key):
        raise HTTPException(status_code=401, detail="Invalid API key format")

    prefix = raw_key[:8]  # "sk_test_" or "sk_live_"
    candidates = (
        db.query(ApiKey)
        .filter(ApiKey.key_prefix == prefix, ApiKey.is_active == True,
                ApiKey.revoked_at == None)
        .limit(20)
        .all()
    )

    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)

    for candidate in candidates:
        if candidate.expires_at and candidate.expires_at < now:
            continue
        if bcrypt.checkpw(raw_key.encode(), candidate.key_hash.encode()):
            # Fire-and-forget last used update
            candidate.last_used_at = now
            db.commit()
            return ApiKeyContext(
                merchant_id=str(candidate.merchant_id),
                environment=candidate.environment.value,
                scopes=candidate.scopes,
            )

    raise HTTPException(status_code=401, detail="Invalid API key")


def require_scope(ctx: ApiKeyContext, scope: str):
    if scope not in ctx.scopes and "*" not in ctx.scopes:
        raise HTTPException(status_code=403, detail=f"Missing scope: {scope}")


def require_account_type(merchant: Merchant, *types: str):
    if merchant.account_type.value not in types:
        raise HTTPException(
            status_code=403,
            detail=f"This endpoint requires account type: {', '.join(types)}"
        )
```

---

## 6. RAIL CONFIG

```python
# app/lib/rails.py
from dataclasses import dataclass
from typing import Optional

@dataclass
class RailConfig:
    rail:        str
    currency:    str
    label:       str
    description: str
    fields:      list  # identifier fields shown in UI

COUNTRY_RAIL_MAP = {
    "BR": RailConfig("PIX",  "BRL", "PIX",             "Instant — Brazil",   ["keyType", "keyValue"]),
    "MX": RailConfig("SPEI", "MXN", "SPEI",            "Instant — Mexico",   ["clabe"]),
    "DE": RailConfig("SEPA", "EUR", "SEPA",            "Instant — Germany",  ["iban", "bic"]),
    "FR": RailConfig("SEPA", "EUR", "SEPA",            "Instant — France",   ["iban", "bic"]),
    "ES": RailConfig("SEPA", "EUR", "SEPA",            "Instant — Spain",    ["iban", "bic"]),
    "IT": RailConfig("SEPA", "EUR", "SEPA",            "Instant — Italy",    ["iban", "bic"]),
    "NL": RailConfig("SEPA", "EUR", "SEPA",            "Instant — Netherlands", ["iban", "bic"]),
    "PT": RailConfig("SEPA", "EUR", "SEPA",            "Instant — Portugal", ["iban", "bic"]),
    "US": RailConfig("ACH",  "USD", "ACH",             "Same day — USA",     ["routingNumber", "accountNumber", "accountType"]),
    "GB": RailConfig("FPS",  "GBP", "Faster Payments", "Instant — UK",       ["sortCode", "accountNumber"]),
}

DEFAULT_RAIL = RailConfig(
    "SWIFT", "USD", "SWIFT",
    "International wire (1–3 business days)",
    ["accountNumber", "swiftCode", "bankName", "bankAddress"]
)

def get_rail_config(country_code: str) -> RailConfig:
    return COUNTRY_RAIL_MAP.get(country_code.upper(), DEFAULT_RAIL)
```

---

## 7. LUMX CLIENT

```python
# app/services/lumx.py
import httpx
from app.config import settings

class LumxClient:
    def __init__(self):
        self.base_url = settings.LUMX_BASE_URL
        self.headers  = {
            "Authorization": f"Bearer {settings.LUMX_API_KEY}",
            "Content-Type":  "application/json",
        }

    def _client(self):
        return httpx.Client(base_url=self.base_url, headers=self.headers, timeout=30.0)

    def post(self, path: str, data: dict, idempotency_key: str = None):
        headers = {}
        if idempotency_key:
            headers["Idempotency-Key"] = idempotency_key
        with self._client() as client:
            response = client.post(path, json=data, headers=headers)
            response.raise_for_status()
            return response.json()

    def get(self, path: str):
        with self._client() as client:
            response = client.get(path)
            response.raise_for_status()
            return response.json()

    def patch(self, path: str, data: dict):
        with self._client() as client:
            response = client.patch(path, json=data)
            response.raise_for_status()
            return response.json()

lumx = LumxClient()
```

---

## 8. CORE ROUTES

### 8.1 Signup (`POST /v1/auth/signup`)

```python
# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from supabase import create_client
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import uuid, bcrypt
from app.database import get_db
from app.models.merchant import Merchant
from app.models.api_key import ApiKey
from app.services.lumx import lumx
from app.lib.ids import generate_api_key
from app.config import settings

router = APIRouter()

supabase_admin = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

class SignupRequest(BaseModel):
    email:         EmailStr
    password:      str
    full_name:     str
    business_name: Optional[str] = None
    business_type: Optional[str] = "INDIVIDUAL"
    country:       Optional[str] = "GH"
    account_type:  Optional[str] = "DEVELOPER"  # DEVELOPER | MERCHANT | INDIVIDUAL
    # INDIVIDUAL only
    tax_id:        Optional[str] = None
    birth_date:    Optional[str] = None  # "YYYY-MM-DD"
    phone:         Optional[str] = None

@router.post("/signup", status_code=201)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    if body.account_type not in ["DEVELOPER", "MERCHANT", "INDIVIDUAL"]:
        raise HTTPException(400, "account_type must be DEVELOPER, MERCHANT, or INDIVIDUAL")

    if body.account_type == "INDIVIDUAL" and (not body.tax_id or not body.birth_date):
        raise HTTPException(400, "tax_id and birth_date required for INDIVIDUAL accounts")

    # 1. Create Supabase Auth user
    try:
        auth_response = supabase_admin.auth.admin.create_user({
            "email":          body.email,
            "password":       body.password,
            "email_confirm":  True,
            "user_metadata":  {"account_type": body.account_type},
        })
    except Exception as e:
        if "already registered" in str(e):
            raise HTTPException(409, "Email already registered")
        raise HTTPException(400, str(e))

    auth_user_id = auth_response.user.id

    # 2. Create Lumx customer
    lumx_payload = (
        {
            "type":      "INDIVIDUAL",
            "name":      body.full_name,
            "email":     body.email,
            "country":   body.country or "GH",
            "taxId":     body.tax_id,
            "birthDate": body.birth_date,
            "accounts":  ["USD"],
        }
        if body.account_type == "INDIVIDUAL"
        else {
            "type":    "BUSINESS" if body.business_type == "BUSINESS" else "INDIVIDUAL",
            "name":    body.business_name or body.full_name,
            "email":   body.email,
            "country": body.country or "GH",
        }
    )

    try:
        lumx_customer = lumx.post("/customers", lumx_payload, idempotency_key=str(uuid.uuid4()))
    except Exception:
        supabase_admin.auth.admin.delete_user(auth_user_id)
        raise HTTPException(502, "Failed to provision payment account")

    # 3. Create merchant row (id = Supabase auth UUID)
    merchant = Merchant(
        id              = uuid.UUID(auth_user_id),
        email           = body.email,
        full_name       = body.full_name,
        business_name   = body.business_name if body.account_type != "INDIVIDUAL" else None,
        business_type   = body.business_type or "INDIVIDUAL",
        country         = body.country or "GH",
        account_type    = body.account_type,
        lumx_customer_id = lumx_customer["id"],
        kyc_sumsub_link = lumx_customer.get("verification", {}).get("link"),
        tax_id          = body.tax_id if body.account_type == "INDIVIDUAL" else None,
        birth_date      = datetime.strptime(body.birth_date, "%Y-%m-%d")
                          if body.birth_date else None,
        phone           = body.phone,
    )
    db.add(merchant)
    db.flush()

    # 4. Issue sandbox API key — DEVELOPER only
    test_api_key = None
    if body.account_type == "DEVELOPER":
        raw_key, key_hash, prefix, last_four = generate_api_key("TEST")
        api_key = ApiKey(
            merchant_id    = merchant.id,
            key_prefix     = prefix,
            key_hash       = key_hash,
            last_four_chars = last_four,
            name           = "Default Test Key",
            environment    = "TEST",
            scopes         = ["charges:create", "links:create", "transactions:read"],
        )
        db.add(api_key)
        test_api_key = raw_key  # shown once

    db.commit()

    redirect_map = {
        "DEVELOPER":  "/dashboard/developers",
        "MERCHANT":   "/dashboard/links",
        "INDIVIDUAL": "/dashboard/remittance",
    }

    return {
        "merchant_id":  str(merchant.id),
        "account_type": merchant.account_type,
        "kyc_link":     merchant.kyc_sumsub_link,
        **({"test_api_key": test_api_key} if test_api_key else {}),
        "redirect_to":  redirect_map[body.account_type],
        "message":      "Account created. Complete KYC to activate live payments.",
    }
```

### 8.2 Register Destination (`POST /v1/destinations`)

```python
# app/routers/destinations.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Any, Optional
import uuid
from app.database import get_db
from app.lib.auth import get_api_key_context, ApiKeyContext
from app.lib.rails import get_rail_config
from app.lib.validators import validate_destination_identifier
from app.models.merchant import Merchant
from app.models.destination import Destination
from app.services.lumx import lumx

router = APIRouter()

class DestinationRequest(BaseModel):
    label:       Optional[str] = None
    country:     str
    holder_name: str
    identifier:  dict[str, Any]

@router.post("", status_code=201)
def create_destination(
    body: DestinationRequest,
    ctx:  ApiKeyContext = Depends(get_api_key_context),
    db:   Session = Depends(get_db),
):
    merchant = db.query(Merchant).filter(Merchant.id == ctx.merchant_id).first()
    if not merchant or not merchant.lumx_customer_id:
        raise HTTPException(422, "Merchant not provisioned in payment network")

    rail_config = get_rail_config(body.country)
    errors = validate_destination_identifier(rail_config.rail, body.identifier)
    if errors:
        raise HTTPException(400, ". ".join(errors))

    lumx_payload = {
        "customerId": merchant.lumx_customer_id,
        "name":       body.label or body.holder_name,
        "rail":       rail_config.rail,
        "currency":   rail_config.currency,
        "identifier": body.identifier,
        "holder": {
            "name":         body.holder_name,
            "relationship": "SELF",
        },
    }

    try:
        lumx_dest = lumx.post(
            f"/customers/{merchant.lumx_customer_id}/destinations",
            lumx_payload,
            idempotency_key=str(uuid.uuid4()),
        )
    except Exception:
        raise HTTPException(502, "Failed to register destination with payment network")

    destination = Destination(
        merchant_id         = merchant.id,
        lumx_destination_id = lumx_dest["id"],
        label               = body.label or body.holder_name,
        rail                = rail_config.rail,
        currency            = rail_config.currency,
        country             = body.country.upper(),
        identifier          = body.identifier,
        holder_name         = body.holder_name,
    )
    db.add(destination)
    db.commit()
    db.refresh(destination)

    return {
        "destination_id":     str(destination.id),
        "lumx_destination_id": destination.lumx_destination_id,
        "status":             "PENDING",
        "rail":               rail_config.rail,
        "currency":           rail_config.currency,
        "settlement_time":    "1–3 business days" if rail_config.rail == "SWIFT" else "Instant",
        "message":            f"Destination registered. Approval takes up to 24 hours.",
    }
```

### 8.3 Create Charge (`POST /v1/charges`) — Developer SDK

```python
# app/routers/charges.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid
from app.database import get_db
from app.lib.auth import get_api_key_context, ApiKeyContext, require_scope
from app.models.merchant import Merchant
from app.models.destination import Destination
from app.models.transaction import Transaction
from app.services.lumx import lumx
from app.lib.ids import generate_charge_id
from app.config import settings

router = APIRouter()

class ChargeRequest(BaseModel):
    amount:          float
    destination_id:  str
    description:     Optional[str] = None
    reference_id:    Optional[str] = None
    metadata:        Optional[dict] = None
    idempotency_key: Optional[str] = None

@router.post("", status_code=202)
def create_charge(
    body: ChargeRequest,
    ctx:  ApiKeyContext = Depends(get_api_key_context),
    db:   Session = Depends(get_db),
):
    require_scope(ctx, "charges:create")

    # Block MERCHANT and INDIVIDUAL — charges are DEVELOPER only
    merchant = db.query(Merchant).filter(Merchant.id == ctx.merchant_id).first()
    if merchant.account_type.value == "MERCHANT":
        raise HTTPException(403, "Charges API not available for no-code accounts. Use payment links.")
    if merchant.account_type.value == "INDIVIDUAL":
        raise HTTPException(403, "Charges API not available for individual accounts. Use remittance.")

    # KYC gate on live
    if ctx.environment == "LIVE" and merchant.kyc_status.value != "APPROVED":
        raise HTTPException(403, "KYC verification required for live charges")

    # Idempotency check
    if body.idempotency_key:
        existing = db.query(Transaction).filter(
            Transaction.idempotency_key == body.idempotency_key
        ).first()
        if existing:
            return _format_charge(existing)

    # Resolve destination
    destination = db.query(Destination).filter(
        Destination.id == body.destination_id,
        Destination.merchant_id == ctx.merchant_id,
        Destination.status == "APPROVED",
    ).first()
    if not destination:
        raise HTTPException(404, "Destination not found or not yet approved")

    charge_id = generate_charge_id()

    # Create pending transaction
    transaction = Transaction(
        merchant_id     = merchant.id,
        destination_id  = destination.id,
        charge_id       = charge_id,
        source_amount   = body.amount,
        source_currency = "USDC",
        target_currency = destination.currency,
        type            = "OFF_RAMP",
        status          = "PENDING",
        description     = body.description,
        reference_id    = body.reference_id,
        metadata        = body.metadata or {},
        idempotency_key = body.idempotency_key,
    )
    db.add(transaction)
    db.flush()

    # Trigger Lumx off-ramp
    try:
        lumx_response = lumx.post("/transactions/off-ramp", {
            "destinationId":  destination.lumx_destination_id,
            "sourceCurrency": "USDC",
            "sourceAmount":   f"{body.amount:.2f}",
            "purpose":        "TRADE_TRANSACTIONS",
            "blockchain":     "BASE",
            "partnerFeeId":   settings.LUMX_PARTNER_FEE_ID,
            "memo":           body.reference_id or charge_id,
            "metadata": {
                "agilepay_charge_id":      charge_id,
                "agilepay_transaction_id": str(transaction.id),
            },
        }, idempotency_key=str(uuid.uuid4()))
    except Exception:
        transaction.status = "FAILED"
        db.commit()
        raise HTTPException(502, "Payment network unavailable")

    transaction.lumx_transaction_id = lumx_response["id"]
    transaction.status = "PROCESSING"
    db.commit()
    db.refresh(transaction)

    return _format_charge(transaction)


def _format_charge(tx: Transaction):
    return {
        "id":                  tx.charge_id,
        "status":              tx.status.value,
        "amount":              float(tx.source_amount),
        "currency":            tx.source_currency,
        "settlement_currency": tx.target_currency,
        "created_at":          tx.created_at.isoformat(),
    }
```

### 8.4 Webhook Ingestion (`POST /v1/webhooks/lumx`)

```python
# app/routers/webhooks.py
from fastapi import APIRouter, Request, HTTPException
from sqlalchemy.orm import Session
from fastapi import Depends
import hmac, hashlib, time, json
from app.database import get_db
from app.models.webhook_log import WebhookLog
from app.models.transaction import Transaction
from app.models.destination import Destination
from app.models.merchant import Merchant
from app.services.lumx import lumx
from app.config import settings
from datetime import datetime, timezone

router = APIRouter()

TIMESTAMP_TOLERANCE = 300  # 5 minutes

@router.post("/lumx")
async def lumx_webhook(request: Request, db: Session = Depends(get_db)):
    # 1. Read raw body BEFORE any parsing
    raw_body    = await request.body()
    signature   = request.headers.get("X-Lumx-Signature", "")
    timestamp   = request.headers.get("X-Lumx-Timestamp", "0")

    # 2. Replay attack guard
    event_ts = int(timestamp)
    now_ts   = int(time.time())
    if abs(now_ts - event_ts) > TIMESTAMP_TOLERANCE:
        return {"received": True}  # silent — don't leak info

    # 3. HMAC-SHA256 verification (timing-safe)
    signed_payload = f"{timestamp}.{raw_body.decode()}"
    expected_sig   = "sha256=" + hmac.new(
        settings.LUMX_WEBHOOK_SECRET.encode(),
        signed_payload.encode(),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(signature.encode(), expected_sig.encode()):
        return {"received": True}  # fail silently

    # 4. Parse event
    event      = json.loads(raw_body)
    event_id   = event.get("id")
    event_type = event.get("type")
    data       = event.get("data", {})

    # 5. Idempotency — skip already-processed events
    existing = db.query(WebhookLog).filter(WebhookLog.lumx_event_id == event_id).first()
    if existing and existing.processed_at:
        return {"received": True, "deduplicated": True}

    # 6. Log inbound event
    log = WebhookLog(
        lumx_event_id    = event_id,
        direction        = "INBOUND",
        event_type       = event_type,
        endpoint         = "/v1/webhooks/lumx",
        source_ip        = request.client.host,
        raw_payload      = event,
        signature_header = signature,
        signature_valid  = True,
    )
    db.add(log)
    db.flush()

    # 7. Handle event
    try:
        _handle_event(event_type, data, db)
        log.processed_at   = datetime.now(timezone.utc)
        log.response_status = 200
    except Exception as e:
        log.processing_error = str(e)
        log.response_status  = 500

    db.commit()
    return {"received": True}


def _handle_event(event_type: str, data: dict, db: Session):
    lumx_tx_id = data.get("id")

    if event_type == "offramp.success":
        confirmed = lumx.get(f"/transactions/{lumx_tx_id}")
        if confirmed.get("state", {}).get("status") != "SUCCESS":
            return
        charge_id = confirmed.get("request", {}).get("metadata", {}).get("agilepay_charge_id")
        if not charge_id:
            return
        tx = db.query(Transaction).filter(Transaction.charge_id == charge_id).first()
        if tx:
            tx.status       = "COMPLETED"
            tx.completed_at = datetime.now(timezone.utc)

    elif event_type == "offramp.failed":
        confirmed = lumx.get(f"/transactions/{lumx_tx_id}")
        charge_id = confirmed.get("request", {}).get("metadata", {}).get("agilepay_charge_id")
        if not charge_id:
            return
        tx = db.query(Transaction).filter(Transaction.charge_id == charge_id).first()
        if tx:
            tx.status    = "FAILED"
            tx.failed_at = datetime.now(timezone.utc)

    elif event_type == "onramp.success":
        confirmed = lumx.get(f"/transactions/{lumx_tx_id}")
        charge_id = confirmed.get("request", {}).get("metadata", {}).get("agilepay_charge_id")
        if not charge_id:
            return
        tx = db.query(Transaction).filter(Transaction.charge_id == charge_id).first()
        if tx:
            tx.status       = "COMPLETED"
            tx.completed_at = datetime.now(timezone.utc)

    elif event_type == "destinations.approved":
        lumx_dest_id = data.get("id")
        dest = db.query(Destination).filter(
            Destination.lumx_destination_id == lumx_dest_id
        ).first()
        if dest:
            dest.status = "APPROVED"

    elif event_type == "destinations.rejected":
        lumx_dest_id = data.get("id")
        dest = db.query(Destination).filter(
            Destination.lumx_destination_id == lumx_dest_id
        ).first()
        if dest:
            dest.status = "REJECTED"

    elif event_type == "customer.verification.approved":
        lumx_customer_id = data.get("id")
        merchant = db.query(Merchant).filter(
            Merchant.lumx_customer_id == lumx_customer_id
        ).first()
        if merchant:
            merchant.kyc_status = "APPROVED"
            merchant.status     = "ACTIVE"

    elif event_type == "customer.verification.rejected":
        lumx_customer_id = data.get("id")
        merchant = db.query(Merchant).filter(
            Merchant.lumx_customer_id == lumx_customer_id
        ).first()
        if merchant:
            merchant.kyc_status = "FINAL_REJECTION"
            merchant.status     = "SUSPENDED"
```

### 8.5 Remittance Routes (`/v1/remittance/*`)

```python
# app/routers/remittance.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Any
import uuid
from app.database import get_db
from app.lib.auth import get_current_merchant
from app.lib.rails import get_rail_config
from app.lib.validators import validate_destination_identifier
from app.lib.ids import generate_charge_id
from app.models.merchant import Merchant
from app.models.recipient import Recipient
from app.models.transaction import Transaction
from app.services.lumx import lumx
from app.config import settings

router = APIRouter()


def _require_individual(merchant: Merchant):
    if merchant.account_type.value != "INDIVIDUAL":
        raise HTTPException(403, "INDIVIDUAL account required")


# ── KYC — extended personal info ─────────────────────────────────────────────
class KycRequest(BaseModel):
    phone:                  str
    address_line1:          str
    address_city:           str
    address_state:          str
    address_postal_code:    str
    address_country:        str
    monthly_volume_usd:     str
    transaction_volume_usd: str
    source_of_funds:        str
    professional_situation: str
    occupation:             str
    jurisdictions:          list[str]

@router.post("/kyc")
def submit_kyc(
    body: KycRequest,
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db),
):
    _require_individual(merchant)
    if merchant.kyc_status.value == "APPROVED":
        raise HTTPException(400, "KYC already approved")

    first_name = merchant.full_name.split(" ")[0]
    last_name  = " ".join(merchant.full_name.split(" ")[1:]) or first_name

    lumx.patch(f"/customers/{merchant.lumx_customer_id}/additional-information", {
        "phone":     body.phone,
        "firstName": first_name,
        "lastName":  last_name,
        "address": {
            "country":    body.address_country,
            "line1":      body.address_line1,
            "city":       body.address_city,
            "state":      body.address_state,
            "postalCode": body.address_postal_code,
        },
        "monthlyVolumeInUSD":        body.monthly_volume_usd,
        "transactionVolumeInUSD":    body.transaction_volume_usd,
        "sourceOfFunds":             body.source_of_funds,
        "professionalSituation":     body.professional_situation,
        "professionalOccupation":    body.occupation,
        "jurisdictions":             body.jurisdictions,
        "transactionCounterparties": ["SELF"],
        "involvedActivities":        ["NONE"],
    })

    merchant.phone                  = body.phone
    merchant.address_line1          = body.address_line1
    merchant.address_city           = body.address_city
    merchant.address_state          = body.address_state
    merchant.address_postal_code    = body.address_postal_code
    merchant.address_country        = body.address_country
    merchant.monthly_volume_usd     = body.monthly_volume_usd
    merchant.transaction_volume_usd = body.transaction_volume_usd
    merchant.source_of_funds        = body.source_of_funds
    merchant.professional_situation = body.professional_situation
    merchant.occupation             = body.occupation
    merchant.jurisdictions          = body.jurisdictions
    merchant.kyc_status             = "PENDING"
    db.commit()

    return {"message": "KYC submitted. Review typically takes 1 business day.",
            "kyc_link": merchant.kyc_sumsub_link}


# ── Deposit — create on-ramp (fund wallet) ────────────────────────────────────
class DepositRequest(BaseModel):
    amount:          str   # e.g. "500.00"
    source_currency: str   # "USD"
    rail:            str   # "ACH" | "SWIFT"

@router.post("/deposit", status_code=202)
def create_deposit(
    body: DepositRequest,
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db),
):
    _require_individual(merchant)
    if merchant.kyc_status.value != "APPROVED":
        raise HTTPException(403, "KYC must be approved before depositing")

    charge_id = generate_charge_id()

    lumx_onramp = lumx.post("/transactions/on-ramp", {
        "customerId":     merchant.lumx_customer_id,
        "rail":           body.rail,
        "sourceCurrency": body.source_currency,
        "sourceAmount":   body.amount,
        "targetCurrency": "USDC",
        "purpose":        "PERSONAL_ACCOUNT",
        "blockchain":     "BASE",
        "partnerFeeId":   settings.LUMX_PARTNER_FEE_ID,
        "metadata":       {"agilepay_charge_id": charge_id},
    }, idempotency_key=str(uuid.uuid4()))

    tx = Transaction(
        merchant_id       = merchant.id,
        charge_id         = charge_id,
        lumx_transaction_id = lumx_onramp["id"],
        type              = "ON_RAMP",
        status            = "AWAITING_FUNDS",
        source_amount     = float(body.amount),
        source_currency   = body.source_currency,
        target_currency   = "USDC",
    )
    db.add(tx)
    db.commit()

    return {
        "charge_id":            charge_id,
        "status":               "AWAITING_FUNDS",
        "payment_instructions": lumx_onramp.get("state", {}).get("payment"),
        "message":              "Send funds to the payment instructions. Wallet credited on receipt.",
    }


# ── Recipients ────────────────────────────────────────────────────────────────
class RecipientRequest(BaseModel):
    full_name:    str
    email:        Optional[str] = None
    phone:        Optional[str] = None
    relationship: str            # "RELATIVE" | "FRIEND"
    country:      str
    identifier:   dict[str, Any]

@router.post("/recipients", status_code=201)
def add_recipient(
    body: RecipientRequest,
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db),
):
    _require_individual(merchant)
    if body.relationship not in ["RELATIVE", "FRIEND"]:
        raise HTTPException(400, "relationship must be RELATIVE or FRIEND")

    rail_config = get_rail_config(body.country)
    errors = validate_destination_identifier(rail_config.rail, body.identifier)
    if errors:
        raise HTTPException(400, ". ".join(errors))

    lumx_dest = lumx.post(
        f"/customers/{merchant.lumx_customer_id}/destinations",
        {
            "customerId": merchant.lumx_customer_id,
            "name":       body.full_name,
            "rail":       rail_config.rail,
            "currency":   rail_config.currency,
            "identifier": body.identifier,
            "holder": {"name": body.full_name, "relationship": body.relationship},
        },
        idempotency_key=str(uuid.uuid4()),
    )

    recipient = Recipient(
        merchant_id         = merchant.id,
        lumx_destination_id = lumx_dest["id"],
        full_name           = body.full_name,
        email               = body.email,
        phone               = body.phone,
        relationship        = body.relationship,
        rail                = rail_config.rail,
        currency            = rail_config.currency,
        country             = body.country.upper(),
        identifier          = body.identifier,
    )
    db.add(recipient)
    db.commit()
    db.refresh(recipient)

    return {"recipient_id": str(recipient.id), "status": "PENDING"}


# ── Lock exchange rate ────────────────────────────────────────────────────────
class RateRequest(BaseModel):
    recipient_id: str
    amount:       str  # USDC amount to send

@router.post("/rate")
def lock_rate(
    body: RateRequest,
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db),
):
    _require_individual(merchant)

    recipient = db.query(Recipient).filter(
        Recipient.id == body.recipient_id,
        Recipient.merchant_id == merchant.id,
        Recipient.status == "APPROVED",
    ).first()
    if not recipient:
        raise HTTPException(404, "Recipient not found or not approved")

    rate = lumx.post("/exchange-rates", {
        "sourceCurrency": "USDC",
        "targetCurrency": recipient.currency,
        "sourceAmount":   body.amount,
        "destinationId":  recipient.lumx_destination_id,
        "partnerFeeId":   settings.LUMX_PARTNER_FEE_ID,
    })

    return {
        "exchange_rate_id":    rate["id"],
        "source_amount":       body.amount,
        "source_currency":     "USDC",
        "final_target_amount": rate["finalTargetAmount"],  # what recipient gets
        "target_currency":     recipient.currency,
        "exchange_rate":       rate["finalExchangeRate"],
        "expires_at":          rate["expiresAt"],          # confirm before this time
    }


# ── Send remittance ───────────────────────────────────────────────────────────
class SendRequest(BaseModel):
    recipient_id:     str
    exchange_rate_id: str
    amount:           str  # USDC amount

@router.post("/send", status_code=202)
def send_remittance(
    body: SendRequest,
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db),
):
    _require_individual(merchant)

    recipient = db.query(Recipient).filter(
        Recipient.id == body.recipient_id,
        Recipient.merchant_id == merchant.id,
        Recipient.status == "APPROVED",
    ).first()
    if not recipient:
        raise HTTPException(404, "Recipient not found or not approved")

    charge_id = generate_charge_id()

    tx = Transaction(
        merchant_id          = merchant.id,
        recipient_id         = recipient.id,
        charge_id            = charge_id,
        type                 = "OFF_RAMP",
        status               = "PENDING",
        source_amount        = float(body.amount),
        source_currency      = "USDC",
        target_currency      = recipient.currency,
        lumx_exchange_rate_id = body.exchange_rate_id,
    )
    db.add(tx)
    db.flush()

    # purpose: BILLS — Lumx required code for P2P remittances
    lumx_response = lumx.post("/transactions/off-ramp", {
        "destinationId":  recipient.lumx_destination_id,
        "sourceCurrency": "USDC",
        "sourceAmount":   body.amount,
        "exchangeRateId": body.exchange_rate_id,
        "purpose":        "BILLS",
        "blockchain":     "BASE",
        "partnerFeeId":   settings.LUMX_PARTNER_FEE_ID,
        "metadata":       {"agilepay_charge_id": charge_id},
    }, idempotency_key=str(uuid.uuid4()))

    tx.lumx_transaction_id = lumx_response["id"]
    tx.status = "PROCESSING"
    db.commit()

    return {"charge_id": charge_id, "status": "PROCESSING"}
```

---

## 9. UTILITY HELPERS

### ID Generator

```python
# app/lib/ids.py
import secrets, string, bcrypt

ALPHABET = string.ascii_letters + string.digits

def _nanoid(size=20):
    return "".join(secrets.choice(ALPHABET) for _ in range(size))

def generate_charge_id():
    return f"chg_{_nanoid()}"

def generate_link_id():
    return f"lnk_{_nanoid(12)}"

def generate_api_key(environment: str):
    env      = "live" if environment == "LIVE" else "test"
    prefix   = f"sk_{env}_"
    secret   = secrets.token_urlsafe(24)[:32]
    raw_key  = f"{prefix}{secret}"
    last_four = raw_key[-4:]
    key_hash = bcrypt.hashpw(raw_key.encode(), bcrypt.gensalt(12)).decode()
    return raw_key, key_hash, prefix, last_four
```

### Destination Validators

```python
# app/lib/validators.py
import re

def validate_destination_identifier(rail: str, identifier: dict) -> list:
    validators = {
        "PIX":     _validate_pix,
        "SPEI":    _validate_spei,
        "SEPA":    _validate_sepa,
        "ACH":     _validate_ach,
        "FEDWIRE": _validate_fedwire,
        "FPS":     _validate_fps,
        "SWIFT":   _validate_swift,
    }
    fn = validators.get(rail)
    return fn(identifier) if fn else [f"Unsupported rail: {rail}"]

def _validate_pix(id):
    errors = []
    if id.get("keyType") not in ["CPF","CNPJ","EMAIL","PHONE","RANDOM"]:
        errors.append("keyType must be CPF, CNPJ, EMAIL, PHONE, or RANDOM")
    if not id.get("keyValue"):
        errors.append("keyValue is required")
    return errors

def _validate_spei(id):
    if not re.match(r"^\d{18}$", str(id.get("clabe",""))):
        return ["clabe must be an 18-digit number"]
    return []

def _validate_sepa(id):
    errors = []
    iban = str(id.get("iban","")).replace(" ","")
    if not re.match(r"^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$", iban):
        errors.append("iban must be a valid IBAN")
    bic = str(id.get("bic","")).upper()
    if bic and not re.match(r"^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$", bic):
        errors.append("bic must be a valid 8 or 11 character BIC")
    return errors

def _validate_ach(id):
    errors = []
    if not re.match(r"^\d{9}$", str(id.get("routingNumber",""))):
        errors.append("routingNumber must be a 9-digit ABA routing number")
    if not id.get("accountNumber"):
        errors.append("accountNumber is required")
    if id.get("accountType") not in ["CHECKING","SAVINGS"]:
        errors.append("accountType must be CHECKING or SAVINGS")
    return errors

def _validate_fedwire(id):
    errors = []
    if not re.match(r"^\d{9}$", str(id.get("routingNumber",""))):
        errors.append("routingNumber must be a 9-digit ABA routing number")
    if not id.get("accountNumber"):
        errors.append("accountNumber is required")
    return errors

def _validate_fps(id):
    errors = []
    if not re.match(r"^\d{2}-?\d{2}-?\d{2}$", str(id.get("sortCode",""))):
        errors.append("sortCode must be in format XX-XX-XX")
    if not re.match(r"^\d{8}$", str(id.get("accountNumber",""))):
        errors.append("accountNumber must be an 8-digit UK account number")
    return errors

def _validate_swift(id):
    errors = []
    if not id.get("accountNumber"):
        errors.append("accountNumber is required")
    swift = str(id.get("swiftCode","")).upper()
    if not re.match(r"^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$", swift):
        errors.append("swiftCode must be a valid 8 or 11 character BIC")
    if not id.get("bankName"):
        errors.append("bankName is required")
    return errors
```

---

## 10. ENVIRONMENT VARIABLES

```bash
# agilepay-api/.env

# Database
DATABASE_URL=postgresql://postgres:password@db.yourproject.supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret   # Settings → API → JWT Secret in Supabase dashboard

# Lumx
LUMX_API_KEY=your-lumx-api-key
LUMX_BASE_URL=https://api-sandbox.lumx.io
LUMX_PARTNER_FEE_ID=uuid-of-partner-fee
LUMX_WEBHOOK_SECRET=whsec_your-signing-secret
LUMX_TREASURY_WALLET=0xYOUR_BASE_WALLET

# App
FRONTEND_URL=http://localhost:3000
ENV=development
```

---

## 11. REQUIREMENTS

```
# requirements.txt
fastapi==0.111.0
uvicorn[standard]==0.29.0
sqlalchemy==2.0.30
alembic==1.13.1
psycopg2-binary==2.9.9
pydantic==2.7.1
pydantic-settings==2.2.1
httpx==0.27.0
bcrypt==4.1.3
PyJWT==2.8.0
supabase==2.4.2
python-dotenv==1.0.1
```

---

## 12. DEPLOYMENT

```
# Procfile (Railway / Render)
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT

# Local development
uvicorn app.main:app --reload --port 8000

# Run migrations
alembic upgrade head
```

### Frontend → FastAPI call example (Next.js JS)

```javascript
// src/lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL; // Railway/Render URL

export async function apiPost(path, body, token) {
  const res = await fetch(`${API_URL}${path}`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}
```

---

## 13. ACCOUNT TYPE SUMMARY

| | DEVELOPER | MERCHANT | INDIVIDUAL |
|---|---|---|---|
| Lumx type | BUSINESS/INDIVIDUAL | BUSINESS/INDIVIDUAL | INDIVIDUAL |
| API keys | ✅ | ❌ | ❌ |
| `POST /charges` | ✅ | ❌ 403 | ❌ 403 |
| Payment links | ✅ | ✅ | ❌ |
| Fund wallet (on-ramp) | ❌ | ❌ | ✅ |
| Add recipients | ❌ | ❌ | ✅ |
| Lock rate + send | ❌ | ❌ | ✅ |
| Dashboard home | `/developers` | `/links` | `/remittance` |
| KYC type | Standard | Standard | Extended (address, income, occupation) |
| Settlement | Off-ramp to own bank | Off-ramp via payment link | Off-ramp to recipient's bank |
| Purpose code | `TRADE_TRANSACTIONS` | `TRADE_TRANSACTIONS` | `BILLS` |

---

*Sources: [Lumx API Docs](https://lumx-9fc2c172.mintlify.app) · [Lumx Remittances Guide](https://lumx-9fc2c172.mintlify.app/guides/use-cases/remittances) · [Lumx Individual Verification](https://lumx-9fc2c172.mintlify.app/guides/individual-verification) · [FastAPI Docs](https://fastapi.tiangolo.com) · [SQLAlchemy Docs](https://docs.sqlalchemy.org)*
