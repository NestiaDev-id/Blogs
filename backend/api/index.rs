use serde_json::json;
use vercel_runtime::{run, Body, Error, Request, Response, StatusCode};

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(handler).await
}

pub async fn handler(_req: Request) -> Result<Response<Body>, Error> {
    let response_body = json!({
        "message": "Welcome to Lentera Novel API!",
        "status": "online"
    })
    .to_string();

    let response = Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "text/plain")
        .header("Access-Control-Allow-Origin", "*")
        .body(Body::from(response_body))
        .expect("Internal Server Error");

    Ok(response)
}
