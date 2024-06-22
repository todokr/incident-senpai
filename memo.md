# スラッシュコマンド

```
{
    "body": {
        "token": "aaaa",
        "team_id": "T0600AYSRP0",
        "team_domain": "incidentsenpai",
        "channel_id": "C0606T6A3B5",
        "channel_name": "リテール事業部インシデント",
        "user_id": "U060W09BBLY",
        "user_name": "hello",
        "command": "/deno",
        "text": "",
        "api_app_id": "A079Y32PJ8Y",
        "is_enterprise_install": "false",
        "response_url": "https://hooks.slack.com/commands/T0600AYSRP0/7318286324580/PCA6YYxRoSRpi4Yh8DyQ9Qk3",
        "trigger_id": "7301248956551.6000372909782.0c55a767fce533f3a63bf4d62fecd07a"
    }
}
```

# モーダル送信

```
application/x-www-form-urlencoded
{
  "body": {
    "type": "view_submission",
    "team": {
      "id": "T0600AYSRP0",
      "domain": "incidentsenpai"
    },
    "user": {
      "id": "U060W09BBLY",
      "username": "hello",
      "name": "hello",
      "team_id": "T0600AYSRP0"
    },
    "api_app_id": "A079Y32PJ8Y",
    "token": "aaaa",
    "trigger_id": "7309189684486.6000372909782.71b79d4d805fcbd383e72a105f6e2f60",
    "view": {
      "id": "V0799LTAR8B",
      "team_id": "T0600AYSRP0",
      "type": "modal",
      "blocks": [
        {
          "type": "section",
          "block_id": "section-1",
          "text": {
            "type": "mrkdwn",
            "text": "Welcome to a modal with _blocks_",
            "verbatim": false
          },
          "accessory": {
            "type": "button",
            "action_id": "button-1",
            "text": {
              "type": "plain_text",
              "text": "Click me!",
              "emoji": true
            }
          }
        },
        {
          "type": "input",
          "block_id": "input-1",
          "label": {
            "type": "plain_text",
            "text": "What are your hopes and dreams?",
            "emoji": true
          },
          "optional": false,
          "dispatch_action": false,
          "element": {
            "type": "plain_text_input",
            "action_id": "dreamy_input",
            "dispatch_action_config": {
              "trigger_actions_on": [
                "on_enter_pressed"
              ]
            }
          }
        }
      ],
      "private_metadata": "",
      "callback_id": "view-id",
      "state": {
        "values": {
          "input-1": {
            "dreamy_input": {
              "type": "plain_text_input",
              "value": "agahogagaga"
            }
          }
        }
      },
      "hash": "1719022171.LODKRR8G",
      "title": {
        "type": "plain_text",
        "text": "My App",
        "emoji": true
      },
      "clear_on_close": false,
      "notify_on_close": false,
      "close": null,
      "submit": {
        "type": "plain_text",
        "text": "Submit",
        "emoji": true
      },
      "previous_view_id": null,
      "root_view_id": "V0799LTAR8B",
      "app_id": "A079Y32PJ8Y",
      "external_id": "",
      "app_installed_team_id": "T0600AYSRP0",
      "bot_id": "B0799JVQYUS"
    },
    "response_urls": [],
    "is_enterprise_install": false,
    "enterprise": null
  }
}
```

# ボタンとか

```
application/x-www-form-urlencoded
{
  "body": {
    "type": "block_actions",
    "user": {
      "id": "U060W09BBLY",
      "username": "hello",
      "name": "hello",
      "team_id": "T0600AYSRP0"
    },
    "api_app_id": "A079Y32PJ8Y",
    "token": "aaaaaaaaa",
    "container": {
      "type": "view",
      "view_id": "V0799LTAR8B"
    },
    "trigger_id": "7309191678150.6000372909782.15c3f45a506da59df392b09b988e02f6",
    "team": {
      "id": "T0600AYSRP0",
      "domain": "incidentsenpai"
    },
    "enterprise": null,
    "is_enterprise_install": false,
    "view": {
      "id": "V0799LTAR8B",
      "team_id": "T0600AYSRP0",
      "type": "modal",
      "blocks": [
        {
          "type": "section",
          "block_id": "section-1",
          "text": {
            "type": "mrkdwn",
            "text": "Welcome to a modal with _blocks_",
            "verbatim": false
          },
          "accessory": {
            "type": "button",
            "action_id": "button-1",
            "text": {
              "type": "plain_text",
              "text": "Click me!",
              "emoji": true
            }
          }
        },
        {
          "type": "input",
          "block_id": "input-1",
          "label": {
            "type": "plain_text",
            "text": "What are your hopes and dreams?",
            "emoji": true
          },
          "optional": false,
          "dispatch_action": false,
          "element": {
            "type": "plain_text_input",
            "action_id": "dreamy_input",
            "dispatch_action_config": {
              "trigger_actions_on": [
                "on_enter_pressed"
              ]
            }
          }
        }
      ],
      "private_metadata": "",
      "callback_id": "view-id",
      "state": {
        "values": {
          "input-1": {
            "dreamy_input": {
              "type": "plain_text_input",
              "value": "agahogagaga"
            }
          }
        }
      },
      "hash": "1719022171.LODKRR8G",
      "title": {
        "type": "plain_text",
        "text": "My App",
        "emoji": true
      },
      "clear_on_close": false,
      "notify_on_close": false,
      "close": null,
      "submit": {
        "type": "plain_text",
        "text": "Submit",
        "emoji": true
      },
      "previous_view_id": null,
      "root_view_id": "V0799LTAR8B",
      "app_id": "A079Y32PJ8Y",
      "external_id": "",
      "app_installed_team_id": "T0600AYSRP0",
      "bot_id": "B0799JVQYUS"
    },
    "actions": [
      {
        "action_id": "button-1",
        "block_id": "section-1",
        "text": {
          "type": "plain_text",
          "text": "Click me!",
          "emoji": true
        },
        "type": "button",
        "action_ts": "1719022315.117459"
      }
    ]
  }
}
```
