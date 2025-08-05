use std::sync::{Arc, Mutex};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{TrayIconBuilder},
    Manager, Runtime, State, Emitter, WindowEvent,
};

#[derive(Default)]
pub struct TimerState {
    pub is_running: bool,
    pub elapsed_time: u64,
    pub start_time: Option<u64>,
}

pub type TimerStateWrapper = Arc<Mutex<TimerState>>;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn update_tray_title(app: tauri::AppHandle, title: String) -> Result<(), String> {
    if let Some(tray) = app.tray_by_id("main") {
        tray.set_title(Some(&title)).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn start_timer(
    app: tauri::AppHandle,
    timer_state: State<TimerStateWrapper>,
) -> Result<(), String> {
    let mut state = timer_state.lock().unwrap();
    if !state.is_running {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64;
        
        state.start_time = Some(now - state.elapsed_time);
        state.is_running = true;
        
        update_tray_menu(&app, true)?;
        app.emit("timer-started", ()).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn pause_timer(
    app: tauri::AppHandle,
    timer_state: State<TimerStateWrapper>,
) -> Result<(), String> {
    let mut state = timer_state.lock().unwrap();
    if state.is_running {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64;
            
        if let Some(start_time) = state.start_time {
            state.elapsed_time = now - start_time;
        }
        state.is_running = false;
        state.start_time = None;
        
        update_tray_menu(&app, false)?;
        app.emit("timer-paused", ()).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn reset_timer(
    app: tauri::AppHandle,
    timer_state: State<TimerStateWrapper>,
) -> Result<(), String> {
    let mut state = timer_state.lock().unwrap();
    state.is_running = false;
    state.elapsed_time = 0;
    state.start_time = None;
    
    update_tray_menu(&app, false)?;
    update_tray_title(app.clone(), "00:00:00".to_string())?;
    app.emit("timer-reset", ()).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_timer_state(timer_state: State<TimerStateWrapper>) -> Result<(bool, u64), String> {
    let state = timer_state.lock().unwrap();
    let current_elapsed = if state.is_running {
        if let Some(start_time) = state.start_time {
            let now = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis() as u64;
            now - start_time
        } else {
            state.elapsed_time
        }
    } else {
        state.elapsed_time
    };
    
    Ok((state.is_running, current_elapsed))
}

#[tauri::command]
fn sync_timer_state(
    app: tauri::AppHandle,
    timer_state: State<TimerStateWrapper>,
    is_running: bool,
    elapsed_time: u64,
) -> Result<(), String> {
    let mut state = timer_state.lock().unwrap();
    
    if is_running != state.is_running {
        state.is_running = is_running;
        state.elapsed_time = elapsed_time;
        
        if is_running {
            let now = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis() as u64;
            state.start_time = Some(now - elapsed_time);
        } else {
            state.start_time = None;
        }
        
        update_tray_menu(&app, is_running)?;
    }
    
    Ok(())
}

fn update_tray_menu(app: &tauri::AppHandle, is_running: bool) -> Result<(), String> {
    let start_pause_text = if is_running { "⏸ Pause" } else { "▶ Start" };
    let start_pause_i = MenuItem::with_id(app, "start_pause", start_pause_text, true, None::<&str>)
        .map_err(|e| e.to_string())?;
    let reset_i = MenuItem::with_id(app, "reset", "Reset", true, None::<&str>)
        .map_err(|e| e.to_string())?;
    let show_i = MenuItem::with_id(app, "show", "Show Window", true, None::<&str>)
        .map_err(|e| e.to_string())?;
    let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)
        .map_err(|e| e.to_string())?;
    
    let menu = Menu::with_items(app, &[&start_pause_i, &reset_i, &show_i, &quit_i])
        .map_err(|e| e.to_string())?;
    
    if let Some(tray) = app.tray_by_id("main") {
        tray.set_menu(Some(menu)).map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

fn create_tray(app: &tauri::AppHandle) -> tauri::Result<()> {
    let start_pause_i = MenuItem::with_id(app, "start_pause", "Start", true, None::<&str>)?;
    let reset_i = MenuItem::with_id(app, "reset", "Reset", true, None::<&str>)?;
    let show_i = MenuItem::with_id(app, "show", "Show Window", true, None::<&str>)?;
    let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&start_pause_i, &reset_i, &show_i, &quit_i])?;

    let _ = TrayIconBuilder::with_id("main")
        .title("00:00:00")
        .menu(&menu)
        .on_menu_event(|app, event| {
            let timer_state: State<TimerStateWrapper> = app.state();
            
            match event.id.as_ref() {
                "start_pause" => {
                    let is_running = {
                        let state = timer_state.lock().unwrap();
                        state.is_running
                    };
                    
                    if is_running {
                        let _ = pause_timer(app.clone(), timer_state);
                    } else {
                        let _ = start_timer(app.clone(), timer_state);
                    }
                }
                "reset" => {
                    let _ = reset_timer(app.clone(), timer_state);
                }
                "quit" => {
                    app.exit(0);
                }
                "show" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                _ => {}
            }
        })
        .build(app)?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let timer_state = TimerStateWrapper::default();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(timer_state)
        .setup(|app| {
            create_tray(app.handle())?;
            
            // Hide the dock icon on macOS
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            
            Ok(())
        })
        .on_window_event(|window, event| {
            match event {
                WindowEvent::CloseRequested { api, .. } => {
                    // Prevent the window from closing and hide it instead
                    api.prevent_close();
                    let _ = window.hide();
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            greet, 
            update_tray_title, 
            start_timer, 
            pause_timer, 
            reset_timer,
            get_timer_state,
            sync_timer_state
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
