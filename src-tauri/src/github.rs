use reqwest;
use serde_json;

pub async fn get_today_activity(token: &str, username: &str) -> Result<String, Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/users/{}/events?per_page=50", username);
    let resp = client.get(&url)
        .header("Authorization", format!("token {}", token))
        .header("User-Agent", "desktop-workbench")
        .header("Accept", "application/vnd.github+json")
        .send().await?;

    let events: Vec<serde_json::Value> = resp.json().await?;
    let today = chrono::Utc::now().format("%Y-%m-%d").to_string();

    let today_events: Vec<serde_json::Value> = events.into_iter().filter(|e| {
        e.get("created_at").and_then(|d| d.as_str()).map(|d| d.starts_with(&today)).unwrap_or(false)
    }).map(|e| {
        serde_json::json!({
            "type": e.get("type").and_then(|t| t.as_str()).unwrap_or(""),
            "repo": e.get("repo").and_then(|r| r.get("name")).and_then(|n| n.as_str()).unwrap_or(""),
            "createdAt": e.get("created_at").and_then(|d| d.as_str()).unwrap_or(""),
        })
    }).collect();

    Ok(serde_json::to_string(&today_events)?)
}

pub async fn get_repo_info(token: &str, repo: &str) -> Result<String, Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{}", repo);
    let resp = client.get(&url)
        .header("Authorization", format!("token {}", token))
        .header("User-Agent", "desktop-workbench")
        .header("Accept", "application/vnd.github+json")
        .send().await?;

    let data: serde_json::Value = resp.json().await?;
    let result = serde_json::json!({
        "name": data.get("name").and_then(|n| n.as_str()).unwrap_or(""),
        "fullName": data.get("full_name").and_then(|n| n.as_str()).unwrap_or(""),
        "stars": data.get("stargazers_count").and_then(|n| n.as_i64()).unwrap_or(0),
        "openIssues": data.get("open_issues_count").and_then(|n| n.as_i64()).unwrap_or(0),
        "pushedAt": data.get("pushed_at").and_then(|d| d.as_str()).unwrap_or(""),
        "description": data.get("description").and_then(|d| d.as_str()).unwrap_or(""),
    });

    Ok(serde_json::to_string(&result)?)
}
