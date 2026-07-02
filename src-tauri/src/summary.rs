use reqwest;
use serde_json;

pub async fn generate(api_key: &str, work_data: &str) -> Result<String, Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let resp = client.post("https://api.deepseek.com/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&serde_json::json!({
            "model": "deepseek-chat",
            "messages": [
                {
                    "role": "system",
                    "content": "你是一个工作日报助手。根据用户提供的今日工作数据（包括手动记录、Git 提交、GitHub 活动、Agent 使用情况），生成结构化的每日工作总结。\n\n输出格式：\n## 今日完成\n- 按项目分组列出完成的工作\n\n## 关键成果\n- 量化的成果数据\n\n## 明日计划\n- 基于今日工作推荐的明日待办\n\n## 一句话总结\n- 用一句话概括今天的工作状态"
                },
                {
                    "role": "user",
                    "content": work_data
                }
            ],
            "temperature": 0.3,
            "max_tokens": 1500,
        }))
        .send().await?;

    let data: serde_json::Value = resp.json().await?;
    let content = data["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("生成失败，请重试")
        .to_string();

    Ok(content)
}
