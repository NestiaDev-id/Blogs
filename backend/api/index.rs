use serde_json::json;
use vercel_runtime::{run, Body, Error, Request, Response, StatusCode};

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(handler).await
}

pub async fn handler(req: Request) -> Result<Response<Body>, Error> {
    let response_body = json!({
        "message": "Welcome to Lentera Novel API!",
        "status": "online"
    }).to_string();

    let accept_header = req.headers()
        .get("accept")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    let mut response = Response::builder().status(StatusCode::OK);

    if accept_header.contains("text/html") {
        response = response.header("Content-Type", "text/plain");
    } else {
        response = response.header("Content-Type", "application/json");
    }

    Ok(response
        .header("Access-Control-Allow-Origin", "*")
        .body(Body::from(response_body))?)
}
