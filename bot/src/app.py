import re
from datetime import datetime
from http import HTTPStatus

import httpx
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Response
from loguru import logger
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from pyrogram.client import Client
from zoneinfo import ZoneInfo

load_dotenv()

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="tel_bot_")

    BOT_API: str = "xxx"
    API_ID: str = "xxx"
    API_HASH: str = "xxx"
    GCAPTCH_PRIV: str = "xxx"
    CHAT_ID: int = -1



settings = Settings()
app = FastAPI()
tel = Client(
    "my_bot",
    bot_token=settings.BOT_API,
    api_id=settings.API_ID,
    api_hash=settings.API_HASH,
)


class Message(BaseModel):
    name: str
    phone: str
    description: str
    checkbox_fz: str
    grecaptcha: str = Field(alias="g-recaptcha-response")

    def model_post_init(self, __context):
        self.phone = self.phone.strip()
        self.name = self.name.strip()
        self.description = self.description.strip()

        if re.match("^(7|8)", p := self.phone):
            self.phone = f"+7{p[1:]}"


async def check_captcha(token: str) -> bool:
    if not token:
        return False
    payload = {
        'secret': settings.GCAPTCH_PRIV,
        'response': token
    }
    async with httpx.AsyncClient() as cl:
        response = await cl.post('https://www.google.com/recaptcha/api/siteverify', data=payload)
    result = response.json()
    logger.debug(result)
    
    return result.get('success')

@app.post("/api/send")
async def home(msg: Message, response: Response):
    logger.debug(f"got message: {msg}")
    if not tel.is_connected:
        await tel.start()
    logger.debug("check captcha")
    if await check_captcha(msg.grecaptcha):
        logger.info("captcha passed")
    else:
        logger.info("captcha failed")
        response.status_code = HTTPStatus.UNAUTHORIZED
        return {"status": "captcha failed"}
    await tel.send_message(
        settings.CHAT_ID,
        "\n".join(
            [
                datetime.now(ZoneInfo("Asia/Novosibirsk")).strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
                "",
                f"Имя: **{msg.name}**",
                f"Телефон: {msg.phone}",
                f"Доп. информация: {msg.description}",
            ],
        ),
    )
    return {"status": "Message sent!"}


def main():
    logger.debug("Main start")
    uvicorn.run(app, host="0.0.0.0", port=8000)
    logger.debug("Main end")


if __name__ == "__main__":
    main()
