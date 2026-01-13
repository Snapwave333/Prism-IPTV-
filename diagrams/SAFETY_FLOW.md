# Safety Guard: Operational Flow

```mermaid
graph TD
    Input[Incoming User Action] --> Intent[Identify Intent]
    Intent --> Type{Action Type?}
    
    Type -- "Destructive" --> Confirm{Pending Confirmation?}
    Confirm -- "No" --> Ask[Request Confirmation]
    Ask --> Wait[Wait for User Response]
    Confirm -- "Yes" --> Execute[Execute Action]
    
    Type -- "Media" --> Spoiler{Spoiler Risk?}
    Spoiler -- "High" --> Warn[Shield Content/Warn User]
    Spoiler -- "Low" --> Stream[Stream Content]
    
    Type -- "System" --> Safe{System Safe?}
    Safe -- "No" --> Fail[Reject & Log]
    Safe -- "Yes" --> Process[Process Request]
```

## Safety Features

- **Hush Mode**: Immediate audio/transport override.
- **Spoiler Shield**: Metadata-aware blur and filtering.
- **Multi-Step Confirmation**: Prevents accidental data loss.
