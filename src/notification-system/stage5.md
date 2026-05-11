# STAGE 5: Scalable Notification Architecture

## Problem with Current Code
```python
function notify_all(student_ids, message):
    for student_id in student_ids:
        send_email(student_id, message)
        save_to_db(student_id, message)
        push_to_app(student_id, message)
```
1. **Blocking Loop:** The main thread is stuck until all 50,000 emails are sent.
2. **Reliability:** If the server crashes at student 10,000, the remaining 40,000 never get notified.
3. **No Retries:** If an email fails for 200 students, there's no mechanism to try again.

## Redesign: Queue-Based Architecture
Use **BullMQ** (Redis) or **RabbitMQ**.

### Process:
1. **Producer:** The main service creates a "Bulk Notification" job and puts it in the queue.
2. **Worker:** Multiple worker processes pick up small batches of students.
3. **Idempotency:** Ensure that if a worker restarts, it doesn't notify the same student twice.

## Revised Pseudocode

```javascript
// Producer
async function notify_all(student_ids, message) {
    // Add a single job to process the bulk notification
    await notificationQueue.add('bulk_notify', { student_ids, message });
}

// Consumer / Worker
notificationQueue.process('bulk_notify', async (job) => {
    const { student_ids, message } = job.data;
    
    for (const student_id of student_ids) {
        try {
            // Send each sub-task to a specific delivery queue for better granularity
            await emailQueue.add('send_email', { student_id, message }, { attempts: 3, backoff: 5000 });
            await dbQueue.add('save_db', { student_id, message });
            await pushQueue.add('push_app', { student_id, message });
        } catch (err) {
            log.error(`Failed to enqueue for student ${student_id}`);
        }
    }
});

// Specific Email Worker
emailQueue.process('send_email', async (job) => {
    await mailService.send(job.data.student_id, job.data.message);
});
```

### Benefits:
- **Scalable:** Add more workers to handle 50,000 students faster.
- **Reliable:** If a worker fails, the job remains in the queue.
- **Retries:** Automatic retries for failed emails.
- **Non-blocking:** The API returns immediately after enqueuing the bulk job.
